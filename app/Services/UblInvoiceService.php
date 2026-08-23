<?php

namespace App\Services;

use App\Models\Invoice;
use DOMDocument;

/**
 * UBL Invoice Service
 * 
 * Generates Peppol BIS 3.0 compliant UBL XML invoices.
 * Based on EN 16931 (European e-invoicing standard).
 */
class UblInvoiceService
{
    /**
     * UBL Namespaces
     */
    private const NS_UBL = 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2';
    private const NS_CAC = 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2';
    private const NS_CBC = 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2';

    /**
     * Tax rate (default 21%)
     */
    private const TAX_RATE = 21.00;
    private const TAX_CATEGORY = 'S'; // Standard rate

    /**
     * Generate UBL XML for an invoice.
     */
    public function generate(Invoice $invoice): string
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;

        // Create root Invoice element
        $root = $dom->createElementNS(self::NS_UBL, 'Invoice');
        $root->setAttribute('xmlns:cac', self::NS_CAC);
        $root->setAttribute('xmlns:cbc', self::NS_CBC);
        $dom->appendChild($root);

        // Add customization and profile IDs for Peppol BIS 3.0
        $this->addElement($dom, $root, 'cbc:CustomizationID', 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0');
        $this->addElement($dom, $root, 'cbc:ProfileID', 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0');

        // Invoice Header
        $this->addElement($dom, $root, 'cbc:ID', $invoice->invoice_number ?? 'INV-' . $invoice->id);
        $this->addElement($dom, $root, 'cbc:IssueDate', $invoice->invoice_date ? $invoice->invoice_date->format('Y-m-d') : now()->format('Y-m-d'));
        
        if ($invoice->due_date) {
            $this->addElement($dom, $root, 'cbc:DueDate', $invoice->due_date->format('Y-m-d'));
        }

        // Invoice Type Code (380 = Commercial invoice)
        $this->addElement($dom, $root, 'cbc:InvoiceTypeCode', '380');

        // Note with IP Transfer terms (if set)
        if ($invoice->hasIpTransfer()) {
            $this->addElement($dom, $root, 'cbc:Note', 'IP/Copyright Terms: ' . $invoice->ip_transfer_text);
        }

        // Document currency
        $this->addElement($dom, $root, 'cbc:DocumentCurrencyCode', 'EUR');

        // Invoice Period (optional)
        $invoicePeriod = $dom->createElement('cac:InvoicePeriod');
        $this->addElement($dom, $invoicePeriod, 'cbc:StartDate', $invoice->invoice_date ? $invoice->invoice_date->format('Y-m-d') : now()->format('Y-m-d'));
        $this->addElement($dom, $invoicePeriod, 'cbc:EndDate', $invoice->due_date ? $invoice->due_date->format('Y-m-d') : now()->addDays(30)->format('Y-m-d'));
        $root->appendChild($invoicePeriod);

        // Order Reference (if from offer)
        if ($invoice->offer) {
            $orderReference = $dom->createElement('cac:OrderReference');
            $this->addElement($dom, $orderReference, 'cbc:ID', $invoice->offer->offer_number ?? 'OFF-' . $invoice->offer_id);
            $root->appendChild($orderReference);
        }

        // Accounting Supplier Party (Seller)
        $this->addSupplierParty($dom, $root, $invoice);

        // Accounting Customer Party (Buyer)
        $this->addCustomerParty($dom, $root, $invoice);

        // Payment Means
        $this->addPaymentMeans($dom, $root, $invoice);

        // Payment Terms
        if ($invoice->due_date) {
            $paymentTerms = $dom->createElement('cac:PaymentTerms');
            $daysUntilDue = now()->diffInDays($invoice->due_date, false);
            $this->addElement($dom, $paymentTerms, 'cbc:Note', 'Payment due within ' . max(0, $daysUntilDue) . ' days');
            $root->appendChild($paymentTerms);
        }

        // Tax Total
        $this->addTaxTotal($dom, $root, $invoice);

        // Legal Monetary Total
        $this->addLegalMonetaryTotal($dom, $root, $invoice);

        // Invoice Lines
        $this->addInvoiceLines($dom, $root, $invoice);

        return $dom->saveXML();
    }

    /**
     * Add a simple element to the document.
     */
    private function addElement(DOMDocument $dom, \DOMNode $parent, string $name, string $value, array $attributes = []): \DOMElement
    {
        $element = $dom->createElement($name, htmlspecialchars($value, ENT_XML1, 'UTF-8'));
        
        foreach ($attributes as $attrName => $attrValue) {
            $element->setAttribute($attrName, $attrValue);
        }
        
        $parent->appendChild($element);
        return $element;
    }

    /**
     * Add supplier party (seller) information.
     */
    private function addSupplierParty(DOMDocument $dom, \DOMNode $root, Invoice $invoice): void
    {
        $company = $invoice->company;
        $companySetting = $company->companySetting ?? null;

        $supplierParty = $dom->createElement('cac:AccountingSupplierParty');
        $party = $dom->createElement('cac:Party');

        // Endpoint ID (e.g., VAT number for Peppol)
        if ($company->vat_number) {
            $endpointID = $dom->createElement('cbc:EndpointID', $company->vat_number);
            $endpointID->setAttribute('schemeID', '9925'); // NL VAT scheme
            $party->appendChild($endpointID);
        }

        // Party Identification
        if ($company->vat_number) {
            $partyIdentification = $dom->createElement('cac:PartyIdentification');
            $this->addElement($dom, $partyIdentification, 'cbc:ID', $company->vat_number);
            $party->appendChild($partyIdentification);
        }

        // Party Name
        $partyName = $dom->createElement('cac:PartyName');
        $this->addElement($dom, $partyName, 'cbc:Name', $company->company_name ?? ($company->first_name . ' ' . $company->surname));
        $party->appendChild($partyName);

        // Postal Address
        $postalAddress = $dom->createElement('cac:PostalAddress');
        if ($company->street) {
            $this->addElement($dom, $postalAddress, 'cbc:StreetName', $company->street . ' ' . ($company->house ?? ''));
        }
        if ($company->city) {
            $this->addElement($dom, $postalAddress, 'cbc:CityName', $company->city);
        }
        if ($company->postal_code) {
            $this->addElement($dom, $postalAddress, 'cbc:PostalZone', $company->postal_code);
        }
        $country = $dom->createElement('cac:Country');
        $this->addElement($dom, $country, 'cbc:IdentificationCode', 'NL'); // Default to NL
        $postalAddress->appendChild($country);
        $party->appendChild($postalAddress);

        // Party Tax Scheme
        if ($company->vat_number) {
            $partyTaxScheme = $dom->createElement('cac:PartyTaxScheme');
            $this->addElement($dom, $partyTaxScheme, 'cbc:CompanyID', $company->vat_number);
            $taxScheme = $dom->createElement('cac:TaxScheme');
            $this->addElement($dom, $taxScheme, 'cbc:ID', 'VAT');
            $partyTaxScheme->appendChild($taxScheme);
            $party->appendChild($partyTaxScheme);
        }

        // Party Legal Entity
        $partyLegalEntity = $dom->createElement('cac:PartyLegalEntity');
        $this->addElement($dom, $partyLegalEntity, 'cbc:RegistrationName', $company->company_name ?? ($company->first_name . ' ' . $company->surname));
        if ($companySetting && $companySetting->registration_number) {
            $this->addElement($dom, $partyLegalEntity, 'cbc:CompanyID', $companySetting->registration_number);
        }
        $party->appendChild($partyLegalEntity);

        // Contact
        $contact = $dom->createElement('cac:Contact');
        if ($company->email) {
            $this->addElement($dom, $contact, 'cbc:ElectronicMail', $company->email);
        }
        if ($company->phone) {
            $this->addElement($dom, $contact, 'cbc:Telephone', $company->phone);
        }
        $party->appendChild($contact);

        $supplierParty->appendChild($party);
        $root->appendChild($supplierParty);
    }

    /**
     * Add customer party (buyer) information.
     */
    private function addCustomerParty(DOMDocument $dom, \DOMNode $root, Invoice $invoice): void
    {
        $customer = $invoice->customer;

        $customerParty = $dom->createElement('cac:AccountingCustomerParty');
        $party = $dom->createElement('cac:Party');

        // Endpoint ID
        if ($customer->vat_number) {
            $endpointID = $dom->createElement('cbc:EndpointID', $customer->vat_number);
            $endpointID->setAttribute('schemeID', '9925');
            $party->appendChild($endpointID);
        }

        // Party Identification
        if ($customer->vat_number) {
            $partyIdentification = $dom->createElement('cac:PartyIdentification');
            $this->addElement($dom, $partyIdentification, 'cbc:ID', $customer->vat_number);
            $party->appendChild($partyIdentification);
        }

        // Party Name
        $partyName = $dom->createElement('cac:PartyName');
        $customerName = $customer->org_name ?? ($customer->first_name . ' ' . $customer->surname);
        $this->addElement($dom, $partyName, 'cbc:Name', $customerName);
        $party->appendChild($partyName);

        // Postal Address
        $postalAddress = $dom->createElement('cac:PostalAddress');
        if ($customer->office_address) {
            $this->addElement($dom, $postalAddress, 'cbc:StreetName', $customer->office_address);
        }
        if ($customer->city) {
            $this->addElement($dom, $postalAddress, 'cbc:CityName', $customer->city);
        }
        if ($customer->postal_code) {
            $this->addElement($dom, $postalAddress, 'cbc:PostalZone', $customer->postal_code);
        }
        $country = $dom->createElement('cac:Country');
        $this->addElement($dom, $country, 'cbc:IdentificationCode', 'NL');
        $postalAddress->appendChild($country);
        $party->appendChild($postalAddress);

        // Party Tax Scheme
        if ($customer->vat_number) {
            $partyTaxScheme = $dom->createElement('cac:PartyTaxScheme');
            $this->addElement($dom, $partyTaxScheme, 'cbc:CompanyID', $customer->vat_number);
            $taxScheme = $dom->createElement('cac:TaxScheme');
            $this->addElement($dom, $taxScheme, 'cbc:ID', 'VAT');
            $partyTaxScheme->appendChild($taxScheme);
            $party->appendChild($partyTaxScheme);
        }

        // Party Legal Entity
        $partyLegalEntity = $dom->createElement('cac:PartyLegalEntity');
        $this->addElement($dom, $partyLegalEntity, 'cbc:RegistrationName', $customerName);
        $party->appendChild($partyLegalEntity);

        // Contact
        $contact = $dom->createElement('cac:Contact');
        $this->addElement($dom, $contact, 'cbc:Name', $customer->first_name . ' ' . $customer->surname);
        if ($customer->email) {
            $this->addElement($dom, $contact, 'cbc:ElectronicMail', $customer->email);
        }
        if ($customer->phone) {
            $this->addElement($dom, $contact, 'cbc:Telephone', $customer->phone);
        }
        $party->appendChild($contact);

        $customerParty->appendChild($party);
        $root->appendChild($customerParty);
    }

    /**
     * Add payment means information.
     */
    private function addPaymentMeans(DOMDocument $dom, \DOMNode $root, Invoice $invoice): void
    {
        $companySetting = $invoice->company->companySetting ?? null;

        $paymentMeans = $dom->createElement('cac:PaymentMeans');
        
        // Payment Means Code (30 = Credit transfer)
        $this->addElement($dom, $paymentMeans, 'cbc:PaymentMeansCode', '30');
        
        // Payment ID (invoice number)
        $this->addElement($dom, $paymentMeans, 'cbc:PaymentID', $invoice->invoice_number ?? 'INV-' . $invoice->id);

        // Payee Financial Account (bank details)
        if ($companySetting && $companySetting->iban) {
            $payeeAccount = $dom->createElement('cac:PayeeFinancialAccount');
            $this->addElement($dom, $payeeAccount, 'cbc:ID', $companySetting->iban);
            
            if ($companySetting->bank_name) {
                $this->addElement($dom, $payeeAccount, 'cbc:Name', $companySetting->bank_name);
            }

            if ($companySetting->bic) {
                $financialInstitutionBranch = $dom->createElement('cac:FinancialInstitutionBranch');
                $this->addElement($dom, $financialInstitutionBranch, 'cbc:ID', $companySetting->bic);
                $payeeAccount->appendChild($financialInstitutionBranch);
            }

            $paymentMeans->appendChild($payeeAccount);
        }

        $root->appendChild($paymentMeans);
    }

    /**
     * Add tax total information.
     */
    private function addTaxTotal(DOMDocument $dom, \DOMNode $root, Invoice $invoice): void
    {
        $taxTotal = $dom->createElement('cac:TaxTotal');
        
        // Total tax amount
        $taxAmount = $this->addElement($dom, $taxTotal, 'cbc:TaxAmount', number_format($invoice->tax_amount, 2, '.', ''));
        $taxAmount->setAttribute('currencyID', 'EUR');

        // Tax subtotal (breakdown by tax category)
        $taxSubtotal = $dom->createElement('cac:TaxSubtotal');
        
        $taxableAmount = $this->addElement($dom, $taxSubtotal, 'cbc:TaxableAmount', number_format($invoice->subtotal, 2, '.', ''));
        $taxableAmount->setAttribute('currencyID', 'EUR');
        
        $subtotalTaxAmount = $this->addElement($dom, $taxSubtotal, 'cbc:TaxAmount', number_format($invoice->tax_amount, 2, '.', ''));
        $subtotalTaxAmount->setAttribute('currencyID', 'EUR');

        // Tax Category
        $taxCategory = $dom->createElement('cac:TaxCategory');
        $this->addElement($dom, $taxCategory, 'cbc:ID', self::TAX_CATEGORY);
        $this->addElement($dom, $taxCategory, 'cbc:Percent', number_format(self::TAX_RATE, 2, '.', ''));
        
        $taxScheme = $dom->createElement('cac:TaxScheme');
        $this->addElement($dom, $taxScheme, 'cbc:ID', 'VAT');
        $taxCategory->appendChild($taxScheme);
        $taxSubtotal->appendChild($taxCategory);

        $taxTotal->appendChild($taxSubtotal);
        $root->appendChild($taxTotal);
    }

    /**
     * Add legal monetary total.
     */
    private function addLegalMonetaryTotal(DOMDocument $dom, \DOMNode $root, Invoice $invoice): void
    {
        $legalMonetaryTotal = $dom->createElement('cac:LegalMonetaryTotal');

        // Line Extension Amount (sum of line totals without tax)
        $lineExtension = $this->addElement($dom, $legalMonetaryTotal, 'cbc:LineExtensionAmount', number_format($invoice->subtotal, 2, '.', ''));
        $lineExtension->setAttribute('currencyID', 'EUR');

        // Tax Exclusive Amount
        $taxExclusive = $this->addElement($dom, $legalMonetaryTotal, 'cbc:TaxExclusiveAmount', number_format($invoice->subtotal, 2, '.', ''));
        $taxExclusive->setAttribute('currencyID', 'EUR');

        // Tax Inclusive Amount
        $taxInclusive = $this->addElement($dom, $legalMonetaryTotal, 'cbc:TaxInclusiveAmount', number_format($invoice->total, 2, '.', ''));
        $taxInclusive->setAttribute('currencyID', 'EUR');

        // Prepaid Amount (already paid)
        $prepaid = $this->addElement($dom, $legalMonetaryTotal, 'cbc:PrepaidAmount', number_format($invoice->amount_paid, 2, '.', ''));
        $prepaid->setAttribute('currencyID', 'EUR');

        // Payable Amount (remaining due)
        $payable = $this->addElement($dom, $legalMonetaryTotal, 'cbc:PayableAmount', number_format($invoice->amount_due, 2, '.', ''));
        $payable->setAttribute('currencyID', 'EUR');

        $root->appendChild($legalMonetaryTotal);
    }

    /**
     * Add invoice line items.
     */
    private function addInvoiceLines(DOMDocument $dom, \DOMNode $root, Invoice $invoice): void
    {
        $lineNumber = 1;

        foreach ($invoice->items as $item) {
            $invoiceLine = $dom->createElement('cac:InvoiceLine');

            // Line ID
            $this->addElement($dom, $invoiceLine, 'cbc:ID', (string)$lineNumber);

            // Invoiced Quantity
            $quantity = $this->addElement($dom, $invoiceLine, 'cbc:InvoicedQuantity', (string)$item->quantity);
            $quantity->setAttribute('unitCode', 'C62'); // Unit (piece)

            // Line Extension Amount (line total without tax)
            $lineTotal = $this->addElement($dom, $invoiceLine, 'cbc:LineExtensionAmount', number_format($item->total, 2, '.', ''));
            $lineTotal->setAttribute('currencyID', 'EUR');

            // Item
            $itemElement = $dom->createElement('cac:Item');
            
            // Description
            $description = $item->service->name ?? 'Service';
            if ($item->description) {
                $description .= ' - ' . $item->description;
            }
            $this->addElement($dom, $itemElement, 'cbc:Description', $description);
            $this->addElement($dom, $itemElement, 'cbc:Name', $item->service->name ?? 'Service');

            // Classified Tax Category
            $classifiedTaxCategory = $dom->createElement('cac:ClassifiedTaxCategory');
            $this->addElement($dom, $classifiedTaxCategory, 'cbc:ID', self::TAX_CATEGORY);
            $this->addElement($dom, $classifiedTaxCategory, 'cbc:Percent', number_format(self::TAX_RATE, 2, '.', ''));
            $taxScheme = $dom->createElement('cac:TaxScheme');
            $this->addElement($dom, $taxScheme, 'cbc:ID', 'VAT');
            $classifiedTaxCategory->appendChild($taxScheme);
            $itemElement->appendChild($classifiedTaxCategory);

            $invoiceLine->appendChild($itemElement);

            // Price
            $price = $dom->createElement('cac:Price');
            $priceAmount = $this->addElement($dom, $price, 'cbc:PriceAmount', number_format($item->price, 2, '.', ''));
            $priceAmount->setAttribute('currencyID', 'EUR');
            $invoiceLine->appendChild($price);

            $root->appendChild($invoiceLine);
            $lineNumber++;
        }
    }
}
