// Get form and result elements
const form = document.getElementById('calculatorForm');
const resultsContainer = document.getElementById('results');

// Format number with thousand separators
function formatNumberWithCommas(value) {
    if (!value && value !== 0) return '';
    // Remove any existing commas and non-numeric characters except decimal point
    const numStr = value.toString().replace(/[^\d.]/g, '');
    if (numStr === '' || numStr === '.') return '';
    
    // Split into integer and decimal parts
    const parts = numStr.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    
    // Remove leading zeros from integer part (but keep at least one digit if it's all zeros)
    integerPart = integerPart.replace(/^0+/, '') || '0';
    
    // Only add commas if the number is >= 1000
    let formattedInteger = integerPart;
    if (integerPart.length > 3) {
        formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return formattedInteger + decimalPart;
}

// Parse formatted number (remove commas) to get actual number
function parseFormattedNumber(value) {
    if (!value) return NaN;
    // Remove commas and parse
    const cleaned = value.toString().replace(/,/g, '');
    return parseFloat(cleaned);
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Format percentage
function formatPercentage(value) {
    return value.toFixed(2) + '%';
}

// Set up input formatting for all number inputs
function setupInputFormatting() {
    // Get all input fields that need formatting
    const numberInputs = [
        'purchasePrice', 'downPayment', 'downPaymentPercent', 'interestRate', 'loanTerm',
        'monthlyRent', 'propertyTaxes', 'insurance', 'maintenance',
        'hoaFees', 'utilities', 'managementFee', 'managementFeePercent', 'vacancyRate', 'appreciationRate', 'rentGrowth', 'holdingPeriod'
    ];
    
    // Fields that are percentages and don't need comma formatting
    const percentageFields = ['downPaymentPercent', 'interestRate', 'maintenance', 
                              'managementFeePercent', 'vacancyRate', 'appreciationRate'];
    
    numberInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            const isPercentage = percentageFields.includes(inputId);
            
            // Format on blur (when user leaves the field)
            input.addEventListener('blur', function() {
                const value = this.value;
                if (value) {
                    if (isPercentage) {
                        // For percentages, just clean up the format
                        const num = parseFloat(value);
                        if (!isNaN(num)) {
                            this.value = num.toFixed(2).replace(/\.?0+$/, '');
                        }
                    } else {
                        this.value = formatNumberWithCommas(value);
                    }
                }
            });
            
            // Format on input (as user types) - simplified approach
            if (!isPercentage) {
                input.addEventListener('input', function() {
                    // Store cursor position
                    const cursorPos = this.selectionStart;
                    const valueBeforeCursor = this.value.substring(0, cursorPos);
                    const digitsBeforeCursor = valueBeforeCursor.replace(/,/g, '').length;
                    
                    // Format the entire value
                    const formatted = formatNumberWithCommas(this.value);
                    
                    // Find new cursor position by counting digits
                    let newCursorPos = 0;
                    let digitCount = 0;
                    for (let i = 0; i < formatted.length; i++) {
                        if (formatted[i] !== ',') {
                            digitCount++;
                            if (digitCount === digitsBeforeCursor) {
                                newCursorPos = i + 1;
                                break;
                            }
                        }
                        if (i === formatted.length - 1) {
                            newCursorPos = formatted.length;
                        }
                    }
                    
                    // Update value and restore cursor
                    this.value = formatted;
                    this.setSelectionRange(newCursorPos, newCursorPos);
                });
            }
        }
    });
}

// Set up down payment synchronization
function setupDownPaymentSync() {
    const downPaymentInput = document.getElementById('downPayment');
    const downPaymentPercentInput = document.getElementById('downPaymentPercent');
    const purchasePriceInput = document.getElementById('purchasePrice');
    
    if (!downPaymentInput || !downPaymentPercentInput || !purchasePriceInput) return;
    
    // Format percentage value (remove trailing zeros)
    function formatPercent(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        // Format to 2 decimal places and remove trailing zeros
        return num.toFixed(2).replace(/\.?0+$/, '');
    }
    
    // When dollar value changes, update percentage
    downPaymentInput.addEventListener('input', function() {
        const purchasePrice = parseFormattedNumber(purchasePriceInput.value);
        const downPayment = parseFormattedNumber(this.value);
        
        if (!isNaN(purchasePrice) && !isNaN(downPayment) && purchasePrice > 0) {
            const percent = (downPayment / purchasePrice) * 100;
            downPaymentPercentInput.value = formatPercent(percent);
        }
    });
    
    // When percentage changes, update dollar value
    downPaymentPercentInput.addEventListener('input', function() {
        const purchasePrice = parseFormattedNumber(purchasePriceInput.value);
        const percent = parseFormattedNumber(this.value);
        
        if (!isNaN(purchasePrice) && !isNaN(percent) && purchasePrice > 0) {
            const dollarValue = (purchasePrice * percent) / 100;
            downPaymentInput.value = formatNumberWithCommas(dollarValue);
        }
    });
    
    // When purchase price changes, update percentage if dollar value exists
    purchasePriceInput.addEventListener('input', function() {
        const purchasePrice = parseFormattedNumber(this.value);
        const downPayment = parseFormattedNumber(downPaymentInput.value);
        
        if (!isNaN(purchasePrice) && !isNaN(downPayment) && purchasePrice > 0 && downPayment > 0) {
            const percent = (downPayment / purchasePrice) * 100;
            downPaymentPercentInput.value = formatPercent(percent);
        }
    });
    
    // Also sync on blur to ensure formatting
    downPaymentInput.addEventListener('blur', function() {
        const purchasePrice = parseFormattedNumber(purchasePriceInput.value);
        const downPayment = parseFormattedNumber(this.value);
        
        if (!isNaN(purchasePrice) && !isNaN(downPayment) && purchasePrice > 0) {
            const percent = (downPayment / purchasePrice) * 100;
            downPaymentPercentInput.value = formatPercent(percent);
        }
    });
    
    downPaymentPercentInput.addEventListener('blur', function() {
        const purchasePrice = parseFormattedNumber(purchasePriceInput.value);
        const percent = parseFormattedNumber(this.value);
        
        if (!isNaN(purchasePrice) && !isNaN(percent) && purchasePrice > 0) {
            const dollarValue = (purchasePrice * percent) / 100;
            downPaymentInput.value = formatNumberWithCommas(dollarValue);
        }
    });
}

// Set up property management fee synchronization
function setupManagementFeeSync() {
    const managementFeeInput = document.getElementById('managementFee');
    const managementFeePercentInput = document.getElementById('managementFeePercent');
    const monthlyRentInput = document.getElementById('monthlyRent');
    
    if (!managementFeeInput || !managementFeePercentInput || !monthlyRentInput) return;
    
    // Format percentage value (remove trailing zeros)
    function formatPercent(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        // Format to 2 decimal places and remove trailing zeros
        return num.toFixed(2).replace(/\.?0+$/, '');
    }
    
    // When dollar value changes, update percentage
    managementFeeInput.addEventListener('input', function() {
        const monthlyRent = parseFormattedNumber(monthlyRentInput.value);
        const managementFee = parseFormattedNumber(this.value);
        
        if (!isNaN(monthlyRent) && !isNaN(managementFee) && monthlyRent > 0) {
            const percent = (managementFee / monthlyRent) * 100;
            managementFeePercentInput.value = formatPercent(percent);
        }
    });
    
    // When percentage changes, update dollar value
    managementFeePercentInput.addEventListener('input', function() {
        const monthlyRent = parseFormattedNumber(monthlyRentInput.value);
        const percent = parseFormattedNumber(this.value);
        
        if (!isNaN(monthlyRent) && !isNaN(percent) && monthlyRent > 0) {
            const dollarValue = (monthlyRent * percent) / 100;
            // Round to 2 decimal places for currency, then format
            const roundedValue = Math.round(dollarValue * 100) / 100;
            managementFeeInput.value = formatNumberWithCommas(roundedValue);
        }
    });
    
    // When monthly rent changes, update percentage if dollar value exists
    monthlyRentInput.addEventListener('input', function() {
        const monthlyRent = parseFormattedNumber(this.value);
        const managementFee = parseFormattedNumber(managementFeeInput.value);
        
        if (!isNaN(monthlyRent) && !isNaN(managementFee) && monthlyRent > 0 && managementFee > 0) {
            const percent = (managementFee / monthlyRent) * 100;
            managementFeePercentInput.value = formatPercent(percent);
        }
    });
    
    // Also sync on blur to ensure formatting
    managementFeeInput.addEventListener('blur', function() {
        const monthlyRent = parseFormattedNumber(monthlyRentInput.value);
        const managementFee = parseFormattedNumber(this.value);
        
        if (!isNaN(monthlyRent) && !isNaN(managementFee) && monthlyRent > 0) {
            const percent = (managementFee / monthlyRent) * 100;
            managementFeePercentInput.value = formatPercent(percent);
        }
    });
    
    managementFeePercentInput.addEventListener('blur', function() {
        const monthlyRent = parseFormattedNumber(monthlyRentInput.value);
        const percent = parseFormattedNumber(this.value);
        
        if (!isNaN(monthlyRent) && !isNaN(percent) && monthlyRent > 0) {
            const dollarValue = (monthlyRent * percent) / 100;
            // Round to 2 decimal places for currency, then format
            const roundedValue = Math.round(dollarValue * 100) / 100;
            managementFeeInput.value = formatNumberWithCommas(roundedValue);
        }
    });
}

// Reset form function
function resetCalculatorForm() {
    const form = document.getElementById('calculatorForm');
    if (form) {
        // Reset all form fields to their default values
        document.getElementById('propertyName').value = '';
        document.getElementById('purchasePrice').value = '';
        document.getElementById('downPayment').value = '';
        document.getElementById('downPaymentPercent').value = '';
        document.getElementById('interestRate').value = '';
        document.getElementById('loanTerm').value = '';
        document.getElementById('monthlyRent').value = '';
        document.getElementById('propertyTaxes').value = '';
        document.getElementById('insurance').value = '';
        document.getElementById('maintenance').value = '0';
        document.getElementById('managementFee').value = '0';
        document.getElementById('managementFeePercent').value = '0';
        document.getElementById('vacancyRate').value = '0';
        document.getElementById('hoaFees').value = '0';
        document.getElementById('utilities').value = '0';
        document.getElementById('appreciationRate').value = '0';
        document.getElementById('rentGrowth').value = '0';
        document.getElementById('holdingPeriod').value = '15';
        
        // Hide results container
        const resultsContainer = document.getElementById('results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
        
        // Hide save button
        const saveBtn = document.getElementById('saveCalculationBtn');
        if (saveBtn) {
            saveBtn.style.display = 'none';
        }
        
        // Clear current calculation data
        window.currentCalculation = null;
    }
}

// Initialize input formatting when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupInputFormatting();
    setupDownPaymentSync();
    setupManagementFeeSync();
    
    // Add reset button handler
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetCalculatorForm();
        });
    }
});

// Calculate monthly mortgage payment
function calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) {
        return principal / numPayments;
    }
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
}

// Handle form submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get all input values and parse formatted numbers
    const purchasePrice = parseFormattedNumber(document.getElementById('purchasePrice').value);
    const downPayment = parseFormattedNumber(document.getElementById('downPayment').value);
    const interestRate = parseFormattedNumber(document.getElementById('interestRate').value);
    const loanTerm = parseFormattedNumber(document.getElementById('loanTerm').value);
    const monthlyRent = parseFormattedNumber(document.getElementById('monthlyRent').value);
    const propertyTaxes = parseFormattedNumber(document.getElementById('propertyTaxes').value);
    const insurance = parseFormattedNumber(document.getElementById('insurance').value);
    const maintenance = parseFormattedNumber(document.getElementById('maintenance').value) || 0;
    const hoaFees = parseFormattedNumber(document.getElementById('hoaFees').value) || 0;
    const utilities = parseFormattedNumber(document.getElementById('utilities').value) || 0;
    const managementFee = parseFormattedNumber(document.getElementById('managementFee').value) || 0;
    const managementFeePercent = parseFormattedNumber(document.getElementById('managementFeePercent').value) || 0;
    const vacancyRate = parseFormattedNumber(document.getElementById('vacancyRate').value) || 0;
    const appreciationRate = parseFormattedNumber(document.getElementById('appreciationRate').value) || 0;
    const rentGrowth = parseFormattedNumber(document.getElementById('rentGrowth').value) || 0;
    const holdingPeriod = parseFormattedNumber(document.getElementById('holdingPeriod').value) || 1;
    
    // Validate inputs
    if (isNaN(purchasePrice) || isNaN(downPayment) || isNaN(interestRate) || 
        isNaN(loanTerm) || isNaN(monthlyRent) || isNaN(propertyTaxes) || 
        isNaN(insurance)) {
        alert('Please fill in all required fields with valid numbers.');
        return;
    }
    
    if (downPayment >= purchasePrice) {
        alert('Down payment must be less than purchase price.');
        return;
    }
    
    // Calculate loan amount
    const loanAmount = purchasePrice - downPayment;
    
    // Calculate monthly mortgage payment
    const monthlyMortgage = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
    
    // Calculate effective monthly rent (accounting for vacancy)
    // Vacancy rate is calculated as a percentage of monthly rent
    const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate / 100);
    
    // Calculate monthly expenses
    const monthlyPropertyTaxes = propertyTaxes / 12;
    const monthlyInsurance = insurance / 12;
    const monthlyMaintenance = effectiveMonthlyRent * (maintenance / 100); // Maintenance as % of rent
    // Use dollar value if provided, otherwise calculate from percentage
    const monthlyManagementFee = managementFee > 0 ? managementFee : (effectiveMonthlyRent * (managementFeePercent / 100));
    const monthlyHOA = hoaFees; // HOA fees are already monthly
    const monthlyUtilities = utilities; // Utilities are already monthly
    
    const totalMonthlyExpenses = monthlyMortgage + monthlyPropertyTaxes + 
                                 monthlyInsurance + monthlyMaintenance + monthlyManagementFee + monthlyHOA + monthlyUtilities;
    
    // Calculate monthly cash flow (Year 1)
    const monthlyCashFlow = effectiveMonthlyRent - totalMonthlyExpenses;
    
    // Calculate annual cash flow (Year 1)
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Calculate total cash invested (down payment)
    const totalCashInvested = downPayment;
    
    // Calculate cash on cash return (based on Year 1)
    const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100;
    
    // Calculate Net Operating Income (NOI) - income minus operating expenses (excluding mortgage)
    const annualMaintenance = effectiveMonthlyRent * 12 * (maintenance / 100); // Annual maintenance as % of rent
    const annualHOA = hoaFees * 12; // Annual HOA fees
    const annualUtilities = utilities * 12; // Annual utilities
    // Use dollar value if provided, otherwise calculate from percentage
    const annualManagementFee = managementFee > 0 ? (managementFee * 12) : (effectiveMonthlyRent * 12 * managementFeePercent / 100);
    const annualOperatingExpenses = propertyTaxes + insurance + annualMaintenance + annualHOA + annualUtilities + annualManagementFee;
    const annualGrossIncome = effectiveMonthlyRent * 12;
    const noi = annualGrossIncome - annualOperatingExpenses;
    
    // Calculate Cap Rate
    const capRate = (noi / purchasePrice) * 100;
    
    // Calculate future property value with appreciation
    const futureValue = purchasePrice * Math.pow(1 + appreciationRate / 100, holdingPeriod);
    
    // Calculate equity gain (future value - purchase price)
    const equityGain = futureValue - purchasePrice;
    
    // Calculate total cash flow over holding period with rent growth
    let totalCashFlowOverPeriod = 0;
    if (rentGrowth > 0) {
        // Calculate cash flow for each year with rent growth
        for (let year = 1; year <= holdingPeriod; year++) {
            // Calculate rent for this year (with growth compounded)
            const yearRent = monthlyRent * Math.pow(1 + rentGrowth / 100, year - 1);
            const yearEffectiveRent = yearRent * (1 - vacancyRate / 100);
            
            // Recalculate expenses that depend on rent (maintenance and management fee)
            const yearMonthlyMaintenance = yearEffectiveRent * (maintenance / 100);
            const yearMonthlyManagementFee = managementFee > 0 ? managementFee : (yearEffectiveRent * (managementFeePercent / 100));
            
            // Monthly expenses (fixed expenses stay the same, rent-based expenses change)
            const yearMonthlyExpenses = monthlyMortgage + monthlyPropertyTaxes + 
                                       monthlyInsurance + yearMonthlyMaintenance + 
                                       yearMonthlyManagementFee + monthlyHOA + monthlyUtilities;
            
            // Yearly cash flow
            const yearCashFlow = (yearEffectiveRent - yearMonthlyExpenses) * 12;
            totalCashFlowOverPeriod += yearCashFlow;
        }
    } else {
        // No rent growth - use simple calculation
        totalCashFlowOverPeriod = annualCashFlow * holdingPeriod;
    }
    
    const totalReturn = totalCashFlowOverPeriod + equityGain;
    
    // Calculate total ROI percentage
    const totalROI = (totalReturn / totalCashInvested) * 100;
    
    // Display results
    document.getElementById('monthlyCashFlow').textContent = formatCurrency(monthlyCashFlow);
    document.getElementById('annualCashFlow').textContent = formatCurrency(annualCashFlow);
    document.getElementById('cashOnCashReturn').textContent = formatPercentage(cashOnCashReturn);
    document.getElementById('capRate').textContent = formatPercentage(capRate);
    document.getElementById('noi').textContent = formatCurrency(noi);
    document.getElementById('totalCashInvested').textContent = formatCurrency(totalCashInvested);
    document.getElementById('totalROI').textContent = formatPercentage(totalROI);
    document.getElementById('totalReturn').textContent = formatCurrency(totalReturn);
    document.getElementById('futureValue').textContent = formatCurrency(futureValue);
    document.getElementById('equityGain').textContent = formatCurrency(equityGain);
    
    // Color code cash flow
    const cashFlowColor = monthlyCashFlow >= 0 ? '#27ae60' : '#e74c3c';
    document.getElementById('monthlyCashFlow').style.color = cashFlowColor;
    document.getElementById('annualCashFlow').style.color = cashFlowColor;
    
    // Color code ROI
    const roiColor = totalROI >= 0 ? '#27ae60' : '#e74c3c';
    document.getElementById('totalROI').style.color = roiColor;
    document.getElementById('totalReturn').style.color = roiColor;
    
    // Show results container
    resultsContainer.style.display = 'block';
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Store current calculation data for saving
    window.currentCalculation = {
        propertyName: document.getElementById('propertyName').value || 'Unnamed Property',
        inputs: {
            purchasePrice,
            downPayment,
            interestRate,
            loanTerm,
            monthlyRent,
            propertyTaxes,
            insurance,
            maintenance,
            hoaFees,
            utilities,
            managementFee,
            managementFeePercent,
            vacancyRate,
            appreciationRate,
            rentGrowth,
            holdingPeriod
        },
        results: {
            monthlyCashFlow,
            annualCashFlow,
            cashOnCashReturn,
            capRate,
            noi,
            totalCashInvested,
            totalROI,
            totalReturn,
            futureValue,
            equityGain
        },
        timestamp: new Date().toISOString()
    };
    
    // Show save button
    document.getElementById('saveCalculationBtn').style.display = 'block';
});

// Tab Navigation
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.nav-tab');
    const pages = document.querySelectorAll('.page-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active page
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(targetTab + '-page').classList.add('active');
            
            // If switching to properties page, refresh the list
            if (targetTab === 'properties') {
                loadSavedProperties();
            }
        });
    });
});

// Save Calculation Functionality
document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('saveCalculationBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            if (!window.currentCalculation) {
                alert('Please calculate a property first before saving.');
                return;
            }
            
            // Get saved properties from localStorage
            let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
            
            // Add new property with unique ID
            const newProperty = {
                id: Date.now().toString(),
                ...window.currentCalculation,
                savedAt: new Date().toISOString()
            };
            
            savedProperties.unshift(newProperty); // Add to beginning
            
            // Save back to localStorage
            localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
            
            // Show success message
            alert('Calculation saved successfully!');
            
            // Optionally switch to properties page
            const propertiesTab = document.querySelector('.nav-tab[data-tab="properties"]');
            if (propertiesTab) {
                propertiesTab.click();
            }
        });
    }
});

// Load and Display Saved Properties
function loadSavedProperties() {
    const propertiesList = document.getElementById('properties-list');
    const emptyState = document.getElementById('empty-state');
    
    // Get saved properties from localStorage
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    
    if (savedProperties.length === 0) {
        emptyState.style.display = 'block';
        propertiesList.innerHTML = '';
        propertiesList.appendChild(emptyState);
        // Still initialize bulk actions
        initializeBulkActions();
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Clear existing content (except empty state)
    const existingCards = propertiesList.querySelectorAll('.property-card');
    existingCards.forEach(card => card.remove());
    
    // Create property cards
    savedProperties.forEach(property => {
        const card = createPropertyCard(property);
        propertiesList.insertBefore(card, emptyState);
    });
    
    // Initialize bulk actions
    initializeBulkActions();
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.dataset.propertyId = property.id;
    
    const date = new Date(property.savedAt || property.timestamp);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    card.innerHTML = `
        <div class="property-header">
            <label class="property-checkbox-label">
                <input type="checkbox" class="property-checkbox" data-property-id="${property.id}" onclick="event.stopPropagation(); updateBulkActions()">
            </label>
            <div class="property-title-section" onclick="togglePropertyCard('${property.id}')">
                <div>
                    <div class="property-name-container">
                        <h3 class="property-name" data-property-id="${property.id}">${escapeHtml(property.propertyName)}</h3>
                        <span class="edit-icon" onclick="event.stopPropagation(); editPropertyName('${property.id}')" title="Edit property name">✏️</span>
                    </div>
                    <div class="property-date">Saved: ${dateStr}</div>
                </div>
            </div>
            <span class="expand-icon" onclick="togglePropertyCard('${property.id}')">▼</span>
        </div>
        <div class="property-content" style="display: none;">
            <div class="property-results-grid">
                <div class="property-result-item">
                    <span class="property-result-label">Monthly Cash Flow</span>
                    <span class="property-result-value">${formatCurrency(property.results.monthlyCashFlow)}</span>
                </div>
                <div class="property-result-item">
                    <span class="property-result-label">Annual Cash Flow</span>
                    <span class="property-result-value">${formatCurrency(property.results.annualCashFlow)}</span>
                </div>
                <div class="property-result-item">
                    <span class="property-result-label">Cash on Cash Return</span>
                    <span class="property-result-value">${formatPercentage(property.results.cashOnCashReturn)}</span>
                </div>
                <div class="property-result-item">
                    <span class="property-result-label">Cap Rate</span>
                    <span class="property-result-value">${formatPercentage(property.results.capRate)}</span>
                </div>
                <div class="property-result-item">
                    <span class="property-result-label">Total ROI</span>
                    <span class="property-result-value">${formatPercentage(property.results.totalROI)}</span>
                </div>
                <div class="property-result-item">
                    <span class="property-result-label">Total Return</span>
                    <span class="property-result-value">${formatCurrency(property.results.totalReturn)}</span>
                </div>
                <div class="property-result-item">
                    <span class="property-result-label">Purchase Price</span>
                    <span class="property-result-value">${formatCurrency(property.inputs.purchasePrice)}</span>
                </div>
                <div class="property-result-item">
                    <span class="property-result-label">Down Payment</span>
                    <span class="property-result-value">${formatCurrency(property.inputs.downPayment)}</span>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteProperty('${property.id}')">Delete</button>
        </div>
    `;
    
    return card;
}

function togglePropertyCard(propertyId) {
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (!card) return;
    
    const content = card.querySelector('.property-content');
    const icon = card.querySelector('.expand-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
        card.classList.add('expanded');
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
        card.classList.remove('expanded');
    }
}

function deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property?')) {
        return;
    }
    
    // Get saved properties
    let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    
    // Remove the property
    savedProperties = savedProperties.filter(p => p.id !== id);
    
    // Save back to localStorage
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    
    // Reload the list
    loadSavedProperties();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize bulk actions handlers (only once)
let bulkActionsInitialized = false;

function initializeBulkActions() {
    if (bulkActionsInitialized) {
        updateBulkActions();
        return;
    }
    
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.property-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBulkActions();
        });
    }
    
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', bulkDeleteProperties);
    }
    
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', cancelBulkSelection);
    }
    
    bulkActionsInitialized = true;
    updateBulkActions();
}

// Update bulk actions visibility and select all state
function updateBulkActions() {
    const checkboxes = document.querySelectorAll('.property-checkbox');
    const checkedBoxes = document.querySelectorAll('.property-checkbox:checked');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    
    // Update select all checkbox state
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedBoxes.length;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
    }
    
    // Update clear button visibility when items are selected
    if (deselectAllBtn) {
        if (checkedBoxes.length > 0) {
            deselectAllBtn.classList.add('has-selection');
        } else {
            deselectAllBtn.classList.remove('has-selection');
        }
    }
    
    // Show/hide delete button based on selection
    if (bulkDeleteBtn) {
        if (checkedBoxes.length > 0) {
            bulkDeleteBtn.style.visibility = 'visible';
            bulkDeleteBtn.style.opacity = '1';
            bulkDeleteBtn.style.pointerEvents = 'auto';
        } else {
            bulkDeleteBtn.style.visibility = 'hidden';
            bulkDeleteBtn.style.opacity = '0';
            bulkDeleteBtn.style.pointerEvents = 'none';
        }
    }
}

// Bulk delete selected properties
function bulkDeleteProperties() {
    const checkedBoxes = document.querySelectorAll('.property-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        return;
    }
    
    const count = checkedBoxes.length;
    const confirmMessage = count === 1 
        ? 'Are you sure you want to delete this property?'
        : `Are you sure you want to delete ${count} properties?`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Get IDs of selected properties
    const selectedIds = Array.from(checkedBoxes).map(checkbox => checkbox.dataset.propertyId);
    
    // Get saved properties and remove selected ones
    let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    savedProperties = savedProperties.filter(p => !selectedIds.includes(p.id));
    
    // Save back to localStorage
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    
    // Reload the list
    loadSavedProperties();
}

// Cancel bulk selection
function cancelBulkSelection() {
    const checkboxes = document.querySelectorAll('.property-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateBulkActions();
}

function editPropertyName(propertyId) {
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (!card) return;
    
    const nameElement = card.querySelector('.property-name');
    const nameContainer = card.querySelector('.property-name-container');
    const editIcon = card.querySelector('.edit-icon');
    
    // Check if already editing - if so, save (checkmark was clicked)
    let inputField = card.querySelector('.property-name-input');
    if (inputField && inputField.classList.contains('editing')) {
        // Save the changes
        savePropertyName(propertyId);
        return;
    }
    
    // Get current name
    const currentName = nameElement.textContent;
    
    // Create input field if it doesn't exist
    if (!inputField) {
        inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'property-name-input';
        inputField.dataset.propertyId = propertyId;
        // Insert before the edit icon so it stays on the right
        nameContainer.insertBefore(inputField, nameElement.nextSibling);
        
        // Prevent clicks in the input field from triggering the expand/collapse
        inputField.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        inputField.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
        inputField.addEventListener('focus', function(e) {
            e.stopPropagation();
        });
    }
    
    // Clone the input field to remove any old event listeners and get a fresh start
    const inputParent = inputField.parentNode;
    const inputNextSibling = inputField.nextSibling;
    const inputValue = currentName;
    const newInputField = inputField.cloneNode(false);
    newInputField.value = inputValue;
    inputParent.replaceChild(newInputField, inputField);
    inputField = newInputField;
    
    // Set input value and show it
    nameElement.classList.add('editing');
    inputField.classList.add('editing');
    
    // Re-attach click prevention handlers
    inputField.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    inputField.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
    inputField.addEventListener('focus', function(e) {
        e.stopPropagation();
    });
    
    // Attach keyboard handlers
    inputField.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            cancelPropertyNameEdit(propertyId);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            savePropertyName(propertyId);
        }
    });
    
    // Change icon to checkmark
    editIcon.textContent = '✓';
    editIcon.classList.add('save-icon');
    editIcon.title = 'Save changes';
    
    // Create and show cancel icon (red X)
    let cancelIcon = card.querySelector('.cancel-icon');
    if (!cancelIcon) {
        cancelIcon = document.createElement('span');
        cancelIcon.className = 'cancel-icon';
        cancelIcon.title = 'Cancel editing';
        cancelIcon.onclick = function(e) {
            e.stopPropagation();
            cancelPropertyNameEdit(propertyId);
        };
        nameContainer.appendChild(cancelIcon);
    }
    cancelIcon.style.display = 'inline-block';
    cancelIcon.textContent = '✕';
    
    inputField.focus();
    inputField.select();
}

function savePropertyName(propertyId) {
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (!card) return;
    
    const nameElement = card.querySelector('.property-name');
    const inputField = card.querySelector('.property-name-input');
    const editIcon = card.querySelector('.edit-icon');
    
    if (!inputField || !inputField.classList.contains('editing')) return;
    
    const originalName = nameElement.textContent;
    const newName = inputField.value.trim();
    
    // If empty, revert to old name
    const finalName = newName || originalName;
    
    // Update the display
    nameElement.textContent = finalName;
    nameElement.classList.remove('editing');
    inputField.classList.remove('editing');
    
    // Change icon back to pencil
    editIcon.textContent = '✏️';
    editIcon.classList.remove('save-icon');
    editIcon.title = 'Edit property name';
    
    // Hide cancel icon
    const cancelIcon = card.querySelector('.cancel-icon');
    if (cancelIcon) {
        cancelIcon.style.display = 'none';
    }
    
    // Save to localStorage
    let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const propertyIndex = savedProperties.findIndex(p => p.id === propertyId);
    if (propertyIndex !== -1) {
        savedProperties[propertyIndex].propertyName = finalName;
        localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    }
}

function cancelPropertyNameEdit(propertyId) {
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (!card) return;
    
    const nameElement = card.querySelector('.property-name');
    const inputField = card.querySelector('.property-name-input');
    const editIcon = card.querySelector('.edit-icon');
    
    if (!inputField || !inputField.classList.contains('editing')) return;
    
    const originalName = nameElement.textContent;
    
    // Restore original value
    inputField.value = originalName;
    nameElement.classList.remove('editing');
    inputField.classList.remove('editing');
    
    // Change icon back to pencil
    editIcon.textContent = '✏️';
    editIcon.classList.remove('save-icon');
    editIcon.title = 'Edit property name';
    
    // Hide cancel icon
    const cancelIcon = card.querySelector('.cancel-icon');
    if (cancelIcon) {
        cancelIcon.style.display = 'none';
    }
}

// Make deleteProperty, togglePropertyCard, editPropertyName, and updateBulkActions available globally for onclick handlers
window.deleteProperty = deleteProperty;
window.togglePropertyCard = togglePropertyCard;
window.editPropertyName = editPropertyName;
window.updateBulkActions = updateBulkActions;
