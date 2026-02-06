// Master Menu Functions - Define early so they're available for onclick handlers
window.toggleMasterMenu = function() {
    console.log('toggleMasterMenu called');
    const menu = document.getElementById('masterMenu');
    const btn = document.getElementById('hamburgerMenuBtn');
    const overlay = document.getElementById('masterMenuOverlay');
    
    console.log('Menu:', menu, 'Btn:', btn, 'Overlay:', overlay);
    
    if (!menu || !btn) {
        console.error('Master menu elements not found');
        return;
    }
    
    menu.classList.toggle('open');
    btn.classList.toggle('active');
    if (overlay) {
        overlay.classList.toggle('active');
    }
    
    console.log('Menu classes:', menu.className);
}

window.navigateToMasterPage = function(pageId) {
    const masterPages = document.querySelectorAll('.master-page');
    masterPages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId + '-master-page');
    if (targetPage) {
        targetPage.classList.add('active');
        if (pageId === 'real-estate-roi') {
            const calculatorPage = document.getElementById('calculator-page');
            const propertiesPage = document.getElementById('properties-page');
            const myPropertiesPage = document.getElementById('my-properties-page');
            if (propertiesPage) propertiesPage.classList.remove('active');
            if (myPropertiesPage) myPropertiesPage.classList.remove('active');
            if (calculatorPage) calculatorPage.classList.add('active');
            const tabs = targetPage.querySelectorAll('.nav-tab');
            tabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === 'calculator') {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }
    }
    window.toggleMasterMenu();
}

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
    
    // Initialize sort direction icon
    updateSortDirectionIcon();
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
                updateSortDirectionIcon();
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
                savedAt: new Date().toISOString(),
                tags: [] // Initialize with empty tags array
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

// Current active filter tags (array to support multiple selections)
let activeFilterTags = [];

// Special identifier for "No tags" filter
const NO_TAGS_FILTER = '__NO_TAGS__';

// Current sort order
let currentSortOrder = 'dateAdded'; // Default to Date Added
let sortDirection = 'desc'; // Default to descending (highest/newest first)

// Load and Display Saved Properties
function loadSavedProperties(expandPropertyId = null) {
    const propertiesList = document.getElementById('properties-list');
    const emptyState = document.getElementById('empty-state');
    
    // Get saved properties from localStorage
    let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    
    // Ensure all properties have a tags array (for backward compatibility)
    savedProperties = savedProperties.map(property => {
        if (!property.tags) {
            property.tags = [];
        }
        return property;
    });
    
    // Update tag filters
    updateTagFilters(savedProperties);
    
    // Filter properties based on active filters (show properties that match ANY of the selected filters)
    if (activeFilterTags.length > 0) {
        const hasNoTagsFilter = activeFilterTags.includes(NO_TAGS_FILTER);
        const regularTags = activeFilterTags.filter(tag => tag !== NO_TAGS_FILTER);
        
        savedProperties = savedProperties.filter(property => {
            const hasNoTags = !property.tags || property.tags.length === 0;
            
            // If "No tags" filter is selected and property has no tags, include it
            if (hasNoTagsFilter && hasNoTags) {
                return true;
            }
            
            // If regular tags are selected and property has a matching tag, include it
            if (regularTags.length > 0 && property.tags && property.tags.some(tag => regularTags.includes(tag))) {
                return true;
            }
            
            return false;
        });
    }
    
    // Sort properties based on current sort order
    savedProperties = sortProperties(savedProperties, currentSortOrder);
    
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
        
        // If this is the property to expand, expand it immediately
        if (expandPropertyId && property.id === expandPropertyId) {
            const content = card.querySelector('.property-content');
            const icon = card.querySelector('.expand-icon');
            if (content && icon) {
                content.style.display = 'block';
                icon.textContent = '▲';
                card.classList.add('expanded');
            }
        }
    });
    
    // Initialize bulk actions
    initializeBulkActions();
}

// Update tag filters list
function updateTagFilters(properties) {
    const filtersList = document.getElementById('tagFiltersList');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    // Get all unique tags from all properties
    const allTags = new Set();
    properties.forEach(property => {
        if (property.tags && Array.isArray(property.tags)) {
            property.tags.forEach(tag => {
                if (tag && tag.trim()) {
                    allTags.add(tag.trim());
                }
            });
        }
    });
    
    // Clear existing filters
    filtersList.innerHTML = '';
    
    // Create "No tags" filter button (always present, first position)
    const noTagsBtn = document.createElement('button');
    noTagsBtn.type = 'button';
    noTagsBtn.className = 'tag-filter-btn';
    if (activeFilterTags.includes(NO_TAGS_FILTER)) {
        noTagsBtn.classList.add('active');
    }
    noTagsBtn.textContent = 'No tags';
    noTagsBtn.onclick = function() {
        toggleFilterTag(NO_TAGS_FILTER);
    };
    filtersList.appendChild(noTagsBtn);
    
    // Create filter buttons for each tag
    const sortedTags = Array.from(allTags).sort();
    sortedTags.forEach(tag => {
        const filterBtn = document.createElement('button');
        filterBtn.type = 'button';
        filterBtn.className = 'tag-filter-btn';
        if (activeFilterTags.includes(tag)) {
            filterBtn.classList.add('active');
        }
        filterBtn.textContent = tag;
        filterBtn.onclick = function() {
            toggleFilterTag(tag);
        };
        filtersList.appendChild(filterBtn);
    });
    
    // Show/hide clear filter button (using visibility to preserve space)
    if (activeFilterTags.length > 0) {
        clearFilterBtn.style.visibility = 'visible';
        clearFilterBtn.style.opacity = '1';
        clearFilterBtn.style.pointerEvents = 'auto';
    } else {
        clearFilterBtn.style.visibility = 'hidden';
        clearFilterBtn.style.opacity = '0';
        clearFilterBtn.style.pointerEvents = 'none';
    }
}

// Toggle filter tag (add if not selected, remove if selected)
function toggleFilterTag(tag) {
    const index = activeFilterTags.indexOf(tag);
    if (index > -1) {
        // Tag is already selected, remove it
        activeFilterTags.splice(index, 1);
    } else {
        // Tag is not selected, add it
        activeFilterTags.push(tag);
    }
    loadSavedProperties();
}

// Clear all filters
function clearFilter() {
    activeFilterTags = [];
    loadSavedProperties();
}

// Apply sorting based on selected option
function applySorting() {
    const selectElement = document.getElementById('orderBySelect');
    if (selectElement) {
        currentSortOrder = selectElement.value;
        loadSavedProperties();
    }
}

// Toggle sort direction (ascending/descending)
function toggleSortDirection() {
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    updateSortDirectionIcon();
    loadSavedProperties();
}

// Update sort direction icon
function updateSortDirectionIcon() {
    const iconElement = document.getElementById('sortDirectionBtn');
    if (iconElement) {
        const iconSpan = iconElement.querySelector('.sort-direction-icon');
        if (iconSpan) {
            iconSpan.textContent = sortDirection === 'desc' ? '▼' : '▲';
        }
        iconElement.title = sortDirection === 'desc' ? 'Currently: Descending (click for Ascending)' : 'Currently: Ascending (click for Descending)';
    }
}

// Sort properties based on sort order
function sortProperties(properties, sortOrder) {
    const sorted = [...properties]; // Create a copy to avoid mutating the original
    const isDescending = sortDirection === 'desc';
    
    switch (sortOrder) {
        case 'dateAdded':
            // Sort by date added
            sorted.sort((a, b) => {
                const dateA = new Date(a.savedAt || a.timestamp);
                const dateB = new Date(b.savedAt || b.timestamp);
                return isDescending ? dateB - dateA : dateA - dateB;
            });
            break;
            
        case 'name':
            // Sort alphabetically by name
            sorted.sort((a, b) => {
                const nameA = (a.propertyName || '').toLowerCase();
                const nameB = (b.propertyName || '').toLowerCase();
                return isDescending ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
            });
            break;
            
        case 'monthlyCashFlow':
            // Sort by monthly cash flow
            sorted.sort((a, b) => {
                const cashFlowA = (a.results && a.results.monthlyCashFlow) || 0;
                const cashFlowB = (b.results && b.results.monthlyCashFlow) || 0;
                return isDescending ? cashFlowB - cashFlowA : cashFlowA - cashFlowB;
            });
            break;
            
        case 'cashOnCashReturn':
            // Sort by cash on cash return
            sorted.sort((a, b) => {
                const returnA = (a.results && a.results.cashOnCashReturn) || 0;
                const returnB = (b.results && b.results.cashOnCashReturn) || 0;
                return isDescending ? returnB - returnA : returnA - returnB;
            });
            break;
            
        case 'purchasePrice':
            // Sort by purchase price
            sorted.sort((a, b) => {
                const priceA = (a.inputs && a.inputs.purchasePrice) || 0;
                const priceB = (b.inputs && b.inputs.purchasePrice) || 0;
                return isDescending ? priceB - priceA : priceA - priceB;
            });
            break;
            
        case 'capRate':
            // Sort by cap rate
            sorted.sort((a, b) => {
                const capRateA = (a.results && a.results.capRate) || 0;
                const capRateB = (b.results && b.results.capRate) || 0;
                return isDescending ? capRateB - capRateA : capRateA - capRateB;
            });
            break;
            
        default:
            // Default to date added
            sorted.sort((a, b) => {
                const dateA = new Date(a.savedAt || a.timestamp);
                const dateB = new Date(b.savedAt || b.timestamp);
                return isDescending ? dateB - dateA : dateA - dateB;
            });
    }
    
    return sorted;
}

// Helper function to get the display value and label for the current sort order
function getSortDisplayValue(property) {
    if (currentSortOrder === 'dateAdded' || currentSortOrder === 'name') {
        const date = new Date(property.savedAt || property.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { label: 'Saved:', value: dateStr };
    }
    
    switch (currentSortOrder) {
        case 'monthlyCashFlow':
            return { 
                label: 'Monthly Cash Flow:', 
                value: formatCurrency((property.results && property.results.monthlyCashFlow) || 0) 
            };
        case 'cashOnCashReturn':
            return { 
                label: 'Cash on Cash Return:', 
                value: formatPercentage((property.results && property.results.cashOnCashReturn) || 0) 
            };
        case 'purchasePrice':
            return { 
                label: 'Purchase Price:', 
                value: formatCurrency((property.inputs && property.inputs.purchasePrice) || 0) 
            };
        case 'capRate':
            return { 
                label: 'Cap Rate:', 
                value: formatPercentage((property.results && property.results.capRate) || 0) 
            };
        default:
            const date = new Date(property.savedAt || property.timestamp);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return { label: 'Saved:', value: dateStr };
    }
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.dataset.propertyId = property.id;
    
    const sortDisplay = getSortDisplayValue(property);
    
    card.innerHTML = `
        <div class="property-header" onclick="togglePropertyCard('${property.id}')">
            <label class="property-checkbox-label">
                <input type="checkbox" class="property-checkbox" data-property-id="${property.id}" onclick="event.stopPropagation(); updateBulkActions()">
            </label>
            <div class="property-title-section">
                <div>
                    <div class="property-name-container">
                        <h3 class="property-name" data-property-id="${property.id}">${escapeHtml(property.propertyName)}</h3>
                        <span class="edit-icon" onclick="event.stopPropagation(); editPropertyName('${property.id}')" title="Edit property name">✏️</span>
                    </div>
                </div>
            </div>
            <div class="property-header-right">
                <div class="property-date">${sortDisplay.label} <strong>${sortDisplay.value}</strong></div>
                <span class="expand-icon">▼</span>
            </div>
        </div>
        <div class="property-content" style="display: none;">
            <div class="property-tags-container-expanded" onclick="event.stopPropagation();">
                ${(property.tags && property.tags.length > 0) ? '<span class="tags-label">Tags:</span>' : ''}
                <div class="property-tags-display" id="tags-display-${property.id}">
                    ${(property.tags && property.tags.length > 0) ? property.tags.map((tag, index) => `<span class="property-tag" data-tag-index="${index}"><span class="tag-text">${escapeHtml(tag)}</span><button class="tag-delete-btn" onclick="event.stopPropagation(); deleteTagByIndex('${property.id}', ${index})" title="Delete tag">✕</button></span>`).join('') : '<span class="no-tags-text">No tags</span>'}
                    <button class="add-tag-btn" onclick="event.stopPropagation(); showAddTagInput('${property.id}')" title="Add tag">+</button>
                </div>
            </div>
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
            <div class="property-actions">
                <button class="edit-btn" onclick="event.stopPropagation(); editProperty('${property.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteProperty('${property.id}')">Delete</button>
            </div>
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
        // When collapsing, also close the tag editor if it's open
        hideAddTagInput(propertyId);
        
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
    
    const bulkExpandBtn = document.getElementById('bulkExpandBtn');
    if (bulkExpandBtn) {
        bulkExpandBtn.addEventListener('click', toggleBulkExpandContract);
    }
    
    bulkActionsInitialized = true;
    updateBulkActions();
}

// Update bulk actions visibility and select all state
function updateBulkActions() {
    const checkboxes = document.querySelectorAll('.property-checkbox');
    const checkedBoxes = document.querySelectorAll('.property-checkbox:checked');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    
    // Update select all checkbox state
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedBoxes.length;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
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
    
    // Show/hide expand/collapse button based on selection
    const bulkExpandBtn = document.getElementById('bulkExpandBtn');
    if (bulkExpandBtn) {
        if (checkedBoxes.length > 0) {
            bulkExpandBtn.style.visibility = 'visible';
            bulkExpandBtn.style.opacity = '1';
            bulkExpandBtn.style.pointerEvents = 'auto';
        } else {
            bulkExpandBtn.style.visibility = 'hidden';
            bulkExpandBtn.style.opacity = '0';
            bulkExpandBtn.style.pointerEvents = 'none';
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

// Toggle expand/contract for all selected property cards
function toggleBulkExpandContract() {
    const checkedBoxes = document.querySelectorAll('.property-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        return;
    }
    
    // Get all selected property cards
    const selectedCards = Array.from(checkedBoxes).map(checkbox => {
        const propertyId = checkbox.dataset.propertyId;
        return document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    }).filter(card => card !== null);
    
    if (selectedCards.length === 0) {
        return;
    }
    
    // Check if any selected card is collapsed (if any is collapsed, expand all; otherwise collapse all)
    const hasAnyCollapsed = selectedCards.some(card => {
        const content = card.querySelector('.property-content');
        return content && content.style.display === 'none';
    });
    
    // Toggle all selected cards
    selectedCards.forEach(card => {
        const content = card.querySelector('.property-content');
        const icon = card.querySelector('.expand-icon');
        
        if (!content || !icon) return;
        
        if (hasAnyCollapsed) {
            // Expand all if any are collapsed
            content.style.display = 'block';
            icon.textContent = '▲';
            card.classList.add('expanded');
        } else {
            // Collapse all if all are expanded
            content.style.display = 'none';
            icon.textContent = '▼';
            card.classList.remove('expanded');
        }
    });
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

// Show add tag input field
function showAddTagInput(propertyId) {
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (!card) return;
    
    const tagsDisplay = card.querySelector(`#tags-display-${propertyId}`);
    const addTagBtn = card.querySelector('.add-tag-btn');
    const tagsContainer = tagsDisplay.parentNode;
    
    // Check if already showing input
    let inputField = card.querySelector('.property-tags-input');
    if (inputField && inputField.classList.contains('editing')) {
        return; // Already showing input
    }
    
    // Get all unique tags from all saved properties for the dropdown
    const allSavedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const allTags = new Set();
    allSavedProperties.forEach(prop => {
        if (prop.tags && Array.isArray(prop.tags)) {
            prop.tags.forEach(tag => {
                if (tag && tag.trim()) {
                    allTags.add(tag.trim());
                }
            });
        }
    });
    const uniqueTags = Array.from(allTags).sort();
    
    // Get current tags for this property
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const property = savedProperties.find(p => p.id === propertyId);
    const currentTags = (property && property.tags) ? property.tags : [];
    
    // Create input field if it doesn't exist
    if (!inputField) {
        inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'property-tags-input';
        inputField.placeholder = 'Type tag name';
        inputField.dataset.propertyId = propertyId;
        // Insert into tagsDisplay, right before the add button
        tagsDisplay.insertBefore(inputField, addTagBtn);
        
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
    
    // Create or update tags dropdown menu
    let tagsDropdown = document.querySelector(`.tags-dropdown-menu[data-property-id="${propertyId}"]`);
    if (!tagsDropdown && uniqueTags.length > 0) {
        tagsDropdown = document.createElement('div');
        tagsDropdown.className = 'tags-dropdown-menu';
        tagsDropdown.dataset.propertyId = propertyId;
        tagsDropdown.style.display = 'none';
        document.body.appendChild(tagsDropdown);
        
        uniqueTags.forEach(tag => {
            const tagOption = document.createElement('div');
            tagOption.className = 'tags-dropdown-option';
            tagOption.textContent = tag;
            tagOption.onclick = function(e) {
                e.stopPropagation();
                addTagToProperty(propertyId, tag);
            };
            tagsDropdown.appendChild(tagOption);
        });
    } else if (tagsDropdown && uniqueTags.length > 0) {
        // Update dropdown options
        tagsDropdown.innerHTML = '';
        uniqueTags.forEach(tag => {
            const tagOption = document.createElement('div');
            tagOption.className = 'tags-dropdown-option';
            tagOption.textContent = tag;
            tagOption.onclick = function(e) {
                e.stopPropagation();
                addTagToProperty(propertyId, tag);
            };
            tagsDropdown.appendChild(tagOption);
        });
    }
    
    // Clone input field for fresh event listeners
    const inputParent = inputField.parentNode;
    const inputNextSibling = inputField.nextSibling;
    const newInputField = inputField.cloneNode(false);
    newInputField.value = '';
    inputParent.replaceChild(newInputField, inputField);
    inputField = newInputField;
    
    // Re-attach click prevention to cloned input
    inputField.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    inputField.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
    inputField.addEventListener('focus', function(e) {
        e.stopPropagation();
    });
    
    inputField.style.display = 'block';
    inputField.classList.add('editing');
    
    // Keyboard handlers - add tag on Enter
    inputField.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            hideAddTagInput(propertyId);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            const tagName = inputField.value.trim();
            if (tagName) {
                addTagToProperty(propertyId, tagName);
                // hideAddTagInput will be called inside addTagToProperty
            }
        }
    });
    
    // FIRST: Convert add button to checkmark and position it
    if (addTagBtn) {
        addTagBtn.style.display = 'inline-flex';
        addTagBtn.classList.add('confirm-btn');
        addTagBtn.textContent = '✓';
        addTagBtn.title = 'Confirm';
        
        // Remove from current position and re-insert right after input field
        addTagBtn.remove();
        if (inputField.nextSibling) {
            tagsDisplay.insertBefore(addTagBtn, inputField.nextSibling);
        } else {
            tagsDisplay.appendChild(addTagBtn);
        }
        
        // Set up the confirm handler - always query for current input field
        addTagBtn.onclick = function(e) {
            e.stopPropagation();
            e.preventDefault();
            const currentInput = card.querySelector('.property-tags-input');
            if (currentInput) {
                const tagName = currentInput.value.trim();
                if (tagName) {
                    addTagToProperty(propertyId, tagName);
                }
            }
        };
    }
    
    // SECOND: Create cancel icon (X) - insert right after checkmark button
    let cancelIcon = card.querySelector('.cancel-tags-icon');
    if (!cancelIcon) {
        cancelIcon = document.createElement('span');
        cancelIcon.className = 'cancel-tags-icon';
        cancelIcon.title = 'Cancel';
        cancelIcon.textContent = '✕';
        cancelIcon.onclick = function(e) {
            e.stopPropagation();
            hideAddTagInput(propertyId);
        };
        // Insert right after the checkmark button (addTagBtn)
        if (addTagBtn && addTagBtn.parentNode === tagsDisplay) {
            // Insert after addTagBtn
            if (addTagBtn.nextSibling) {
                tagsDisplay.insertBefore(cancelIcon, addTagBtn.nextSibling);
            } else {
                tagsDisplay.appendChild(cancelIcon);
            }
        } else {
            tagsDisplay.appendChild(cancelIcon);
        }
    } else {
        // If cancel icon already exists, reposition it after checkmark
        cancelIcon.remove();
        if (addTagBtn && addTagBtn.parentNode === tagsDisplay) {
            if (addTagBtn.nextSibling) {
                tagsDisplay.insertBefore(cancelIcon, addTagBtn.nextSibling);
            } else {
                tagsDisplay.appendChild(cancelIcon);
            }
        } else {
            tagsDisplay.appendChild(cancelIcon);
        }
    }
    cancelIcon.style.display = 'inline-block';
    
    // THIRD: Create or update tags dropdown button - insert after cancel icon
    let tagsDropdownBtn = card.querySelector('.tags-dropdown-btn');
    if (!tagsDropdownBtn && uniqueTags.length > 0) {
        tagsDropdownBtn = document.createElement('button');
        tagsDropdownBtn.type = 'button';
        tagsDropdownBtn.className = 'tags-dropdown-btn';
        tagsDropdownBtn.textContent = '📋';
        tagsDropdownBtn.title = 'Select from existing tags';
        tagsDropdownBtn.onclick = function(e) {
            e.stopPropagation();
            toggleTagsDropdown(propertyId);
        };
        // Insert after cancel icon
        if (cancelIcon && cancelIcon.parentNode === tagsDisplay) {
            if (cancelIcon.nextSibling) {
                tagsDisplay.insertBefore(tagsDropdownBtn, cancelIcon.nextSibling);
            } else {
                tagsDisplay.appendChild(tagsDropdownBtn);
            }
        } else {
            tagsDisplay.appendChild(tagsDropdownBtn);
        }
    } else if (tagsDropdownBtn) {
        // If dropdown already exists, reposition it after cancel
        tagsDropdownBtn.remove();
        if (cancelIcon && cancelIcon.parentNode === tagsDisplay) {
            if (cancelIcon.nextSibling) {
                tagsDisplay.insertBefore(tagsDropdownBtn, cancelIcon.nextSibling);
            } else {
                tagsDisplay.appendChild(tagsDropdownBtn);
            }
        } else {
            tagsDisplay.appendChild(tagsDropdownBtn);
        }
    }
    
    inputField.focus();
}

// Hide add tag input field
function hideAddTagInput(propertyId) {
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (!card) return;
    
    const inputField = card.querySelector('.property-tags-input');
    const cancelIcon = card.querySelector('.cancel-tags-icon');
    const addTagBtn = card.querySelector('.add-tag-btn');
    const tagsDropdownBtn = card.querySelector('.tags-dropdown-btn');
    const tagsDropdown = document.querySelector(`.tags-dropdown-menu[data-property-id="${propertyId}"]`);
    
    if (inputField) {
        inputField.style.display = 'none';
        inputField.classList.remove('editing');
        inputField.value = '';
    }
    
    if (cancelIcon) {
        cancelIcon.style.display = 'none';
    }
    
    if (tagsDropdownBtn) {
        tagsDropdownBtn.remove();
    }
    
    if (tagsDropdown) {
        tagsDropdown.remove();
    }
    
    if (addTagBtn) {
        addTagBtn.style.display = 'inline-flex';
        // Restore the original appearance and onclick handler
        addTagBtn.classList.remove('confirm-btn');
        addTagBtn.textContent = '+';
        addTagBtn.title = 'Add tag';
        addTagBtn.onclick = function(e) {
            e.stopPropagation();
            showAddTagInput(propertyId);
        };
    }
}

// Add a tag to a property
function addTagToProperty(propertyId, tagName) {
    if (!tagName || !tagName.trim()) return;
    
    tagName = tagName.trim();
    
    // Get saved properties
    let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const propertyIndex = savedProperties.findIndex(p => p.id === propertyId);
    
    if (propertyIndex === -1) return;
    
    const property = savedProperties[propertyIndex];
    if (!property.tags) {
        property.tags = [];
    }
    
    // Don't add duplicate tags
    if (property.tags.includes(tagName)) {
        return;
    }
    
    // Add the tag
    property.tags.push(tagName);
    
    // Save to localStorage
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    
    // Update the display
    updateTagsDisplay(propertyId);
    
    // Update tag filters
    updateTagFilters(savedProperties);
    
    // Hide the input field and return to default state
    hideAddTagInput(propertyId);
    
    // Update dropdown menu if it exists (for future use)
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (card) {
        const tagsDropdown = document.querySelector(`.tags-dropdown-menu[data-property-id="${propertyId}"]`);
        if (tagsDropdown) {
            // Get all unique tags again
            const allTags = new Set();
            savedProperties.forEach(prop => {
                if (prop.tags && Array.isArray(prop.tags)) {
                    prop.tags.forEach(tag => {
                        if (tag && tag.trim()) {
                            allTags.add(tag.trim());
                        }
                    });
                }
            });
            const uniqueTags = Array.from(allTags).sort();
            
            // Rebuild dropdown
            tagsDropdown.innerHTML = '';
            uniqueTags.forEach(tag => {
                const tagOption = document.createElement('div');
                tagOption.className = 'tags-dropdown-option';
                tagOption.textContent = tag;
                tagOption.onclick = function(e) {
                    e.stopPropagation();
                    addTagToProperty(propertyId, tag);
                };
                tagsDropdown.appendChild(tagOption);
            });
        }
    }
}

// Update tags display for a property
function updateTagsDisplay(propertyId) {
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (!card) return;
    
    const tagsDisplay = card.querySelector(`#tags-display-${propertyId}`);
    if (!tagsDisplay) return;
    
    // Get the tags container and label
    const tagsContainer = tagsDisplay.parentNode;
    let tagsLabel = tagsContainer.querySelector('.tags-label');
    
    // Check if we're in editing mode - if so, preserve editing elements
    const inputField = card.querySelector('.property-tags-input');
    const isEditing = inputField && inputField.classList.contains('editing');
    
    // Get current tags
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const property = savedProperties.find(p => p.id === propertyId);
    const currentTags = (property && property.tags) ? property.tags : [];
    
    // Show or hide the "Tags:" label based on whether there are tags
    if (currentTags.length > 0) {
        if (!tagsLabel) {
            tagsLabel = document.createElement('span');
            tagsLabel.className = 'tags-label';
            tagsLabel.textContent = 'Tags:';
            tagsContainer.insertBefore(tagsLabel, tagsDisplay);
        }
        tagsLabel.style.display = 'inline';
    } else {
        if (tagsLabel) {
            tagsLabel.style.display = 'none';
        }
    }
    
    // If editing, preserve all editing elements
    if (isEditing) {
        // Get all editing elements before updating
        const addTagBtn = tagsDisplay.querySelector('.add-tag-btn');
        const cancelIcon = card.querySelector('.cancel-tags-icon');
        const tagsDropdownBtn = card.querySelector('.tags-dropdown-btn');
        
        // Update only the tags part, preserving other elements
        const tagElements = tagsDisplay.querySelectorAll('.property-tag, .no-tags-text');
        tagElements.forEach(el => el.remove());
        
        // Add updated tags
        if (currentTags.length > 0) {
            currentTags.forEach((tag, index) => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'property-tag';
                tagSpan.dataset.tagIndex = index;
                const tagText = document.createElement('span');
                tagText.className = 'tag-text';
                tagText.textContent = escapeHtml(tag);
                tagSpan.appendChild(tagText);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'tag-delete-btn';
                deleteBtn.textContent = '✕';
                deleteBtn.title = 'Delete tag';
                deleteBtn.onclick = function(e) {
                    e.stopPropagation();
                    deleteTagByIndex(propertyId, index);
                };
                tagSpan.appendChild(deleteBtn);
                
                tagsDisplay.insertBefore(tagSpan, inputField || addTagBtn);
            });
        } else {
            const noTagsSpan = document.createElement('span');
            noTagsSpan.className = 'no-tags-text';
            noTagsSpan.textContent = 'No tags';
            tagsDisplay.insertBefore(noTagsSpan, inputField || addTagBtn);
        }
        
        // Ensure add button exists and is in confirm mode (since we're editing)
        if (!addTagBtn) {
            const newAddBtn = document.createElement('button');
            newAddBtn.className = 'add-tag-btn confirm-btn';
            newAddBtn.textContent = '✓';
            newAddBtn.title = 'Confirm';
            newAddBtn.onclick = function(e) {
                e.stopPropagation();
                e.preventDefault();
                const currentInputField = card.querySelector('.property-tags-input');
                if (currentInputField) {
                    const tagName = currentInputField.value.trim();
                    if (tagName) {
                        addTagToProperty(propertyId, tagName);
                    }
                }
            };
            // Insert first (after input field, before cancel and dropdown)
            if (inputField && inputField.nextSibling) {
                tagsDisplay.insertBefore(newAddBtn, inputField.nextSibling);
            } else {
                tagsDisplay.appendChild(newAddBtn);
            }
            newAddBtn.style.display = 'inline-flex';
        } else {
            // Ensure it's in confirm mode
            addTagBtn.classList.add('confirm-btn');
            addTagBtn.textContent = '✓';
            addTagBtn.title = 'Confirm';
            addTagBtn.onclick = function(e) {
                e.stopPropagation();
                e.preventDefault();
                const currentInputField = card.querySelector('.property-tags-input');
                if (currentInputField) {
                    const tagName = currentInputField.value.trim();
                    if (tagName) {
                        addTagToProperty(propertyId, tagName);
                    }
                }
            };
            addTagBtn.style.display = 'inline-flex';
        }
    } else {
        // Not editing - simple update
        const addTagBtn = tagsDisplay.querySelector('.add-tag-btn');
        const addTagBtnHTML = addTagBtn ? addTagBtn.outerHTML : '<button class="add-tag-btn" onclick="event.stopPropagation(); showAddTagInput(\'' + propertyId + '\')" title="Add tag">+</button>';
        
        // Update display
        if (currentTags.length > 0) {
            tagsDisplay.innerHTML = currentTags.map((tag, index) => `<span class="property-tag" data-tag-index="${index}"><span class="tag-text">${escapeHtml(tag)}</span><button class="tag-delete-btn" onclick="event.stopPropagation(); deleteTagByIndex('${propertyId}', ${index})" title="Delete tag">✕</button></span>`).join('') + addTagBtnHTML;
        } else {
            tagsDisplay.innerHTML = '<span class="no-tags-text">No tags</span>' + addTagBtnHTML;
        }
    }
}

// Legacy function for backward compatibility (kept for any remaining references)
function editPropertyTags(propertyId) {
    showAddTagInput(propertyId);
}

// Legacy function - no longer used but kept for compatibility
function savePropertyTags(propertyId) {
    // This function is no longer used with the new tag system
    // Tags are now added one at a time via addTagToProperty
    hideAddTagInput(propertyId);
}

// Delete a tag from a property by index
function deleteTagByIndex(propertyId, tagIndex) {
    // Get saved properties
    let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const propertyIndex = savedProperties.findIndex(p => p.id === propertyId);
    
    if (propertyIndex === -1) return;
    
    const property = savedProperties[propertyIndex];
    if (!property.tags || !Array.isArray(property.tags) || tagIndex < 0 || tagIndex >= property.tags.length) {
        return;
    }
    
    // Remove the tag at the specified index
    property.tags.splice(tagIndex, 1);
    
    // Save to localStorage
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    
    // Update the display
    updateTagsDisplay(propertyId);
    
    // Update tag filters
    updateTagFilters(savedProperties);
}

// Delete a tag from a property by name (for backward compatibility)
function deleteTag(propertyId, tagName) {
    if (!tagName || !tagName.trim()) return;
    
    tagName = tagName.trim();
    
    // Get saved properties
    let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const propertyIndex = savedProperties.findIndex(p => p.id === propertyId);
    
    if (propertyIndex === -1) return;
    
    const property = savedProperties[propertyIndex];
    if (!property.tags || !Array.isArray(property.tags)) {
        return;
    }
    
    // Find the index of the tag
    const tagIndex = property.tags.indexOf(tagName);
    if (tagIndex === -1) return;
    
    // Use the index-based function
    deleteTagByIndex(propertyId, tagIndex);
}

// Legacy function - now just calls hideAddTagInput
function cancelPropertyTagsEdit(propertyId) {
    hideAddTagInput(propertyId);
}

// Toggle tags dropdown menu
function toggleTagsDropdown(propertyId) {
    const card = document.querySelector(`.property-card[data-property-id="${propertyId}"]`);
    if (!card) return;
    
    const dropdown = document.querySelector(`.tags-dropdown-menu[data-property-id="${propertyId}"]`);
    const dropdownBtn = card.querySelector('.tags-dropdown-btn');
    if (dropdown && dropdownBtn) {
        const isVisible = dropdown.style.display !== 'none';
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        // Position dropdown below the button using getBoundingClientRect for fixed positioning
        if (!isVisible) {
            const btnRect = dropdownBtn.getBoundingClientRect();
            dropdown.style.position = 'fixed';
            dropdown.style.left = btnRect.left + 'px';
            dropdown.style.top = (btnRect.bottom + 4) + 'px';
        }
    }
    
    // Close other dropdowns when opening this one
    if (dropdown && dropdown.style.display !== 'none') {
        document.querySelectorAll('.tags-dropdown-menu').forEach(menu => {
            if (menu !== dropdown) {
                menu.style.display = 'none';
            }
        });
    }
}

// Add tag to input field (legacy - now directly adds to property)
function addTagToInput(inputField, tag) {
    // This function is now replaced by addTagToProperty
    // But we'll keep it for backward compatibility
    const card = inputField.closest('.property-card');
    if (card) {
        const propertyId = card.dataset.propertyId;
        addTagToProperty(propertyId, tag);
        
        // Close dropdown
        const dropdown = document.querySelector(`.tags-dropdown-menu[data-property-id="${propertyId}"]`);
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
}

// Edit Property Functionality
let currentEditingPropertyId = null;

function editProperty(propertyId) {
    currentEditingPropertyId = propertyId;
    
    // Get the property data
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const property = savedProperties.find(p => p.id === propertyId);
    
    if (!property) {
        alert('Property not found');
        return;
    }
    
    // Populate the edit form with existing data
    document.getElementById('editPropertyName').value = property.propertyName || '';
    document.getElementById('editPurchasePrice').value = formatNumberWithCommas(property.inputs.purchasePrice);
    document.getElementById('editDownPayment').value = formatNumberWithCommas(property.inputs.downPayment);
    
    // Calculate down payment percentage
    const downPaymentPercent = property.inputs.downPayment && property.inputs.purchasePrice 
        ? ((property.inputs.downPayment / property.inputs.purchasePrice) * 100).toFixed(2).replace(/\.?0+$/, '')
        : '';
    document.getElementById('editDownPaymentPercent').value = downPaymentPercent;
    
    document.getElementById('editInterestRate').value = property.inputs.interestRate || '';
    document.getElementById('editLoanTerm').value = property.inputs.loanTerm || '30';
    document.getElementById('editMonthlyRent').value = formatNumberWithCommas(property.inputs.monthlyRent);
    document.getElementById('editPropertyTaxes').value = formatNumberWithCommas(property.inputs.propertyTaxes);
    document.getElementById('editInsurance').value = formatNumberWithCommas(property.inputs.insurance);
    document.getElementById('editMaintenance').value = property.inputs.maintenance || '0';
    document.getElementById('editHoaFees').value = formatNumberWithCommas(property.inputs.hoaFees || 0);
    document.getElementById('editUtilities').value = formatNumberWithCommas(property.inputs.utilities || 0);
    document.getElementById('editVacancyRate').value = property.inputs.vacancyRate || '0';
    document.getElementById('editAppreciationRate').value = property.inputs.appreciationRate || '0';
    document.getElementById('editRentGrowth').value = property.inputs.rentGrowth || '0';
    document.getElementById('editHoldingPeriod').value = property.inputs.holdingPeriod || '15';
    
    // Handle management fee
    if (property.inputs.managementFee > 0) {
        document.getElementById('editManagementFee').value = formatNumberWithCommas(property.inputs.managementFee);
        document.getElementById('editManagementFeePercent').value = '0';
    } else if (property.inputs.managementFeePercent > 0) {
        document.getElementById('editManagementFee').value = '0';
        document.getElementById('editManagementFeePercent').value = property.inputs.managementFeePercent.toFixed(2).replace(/\.?0+$/, '');
    } else {
        document.getElementById('editManagementFee').value = '0';
        document.getElementById('editManagementFeePercent').value = '0';
    }
    
    // Calculate scrollbar width and prevent body scroll
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
        document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
    }
    document.body.classList.add('modal-open');
    const modal = document.getElementById('editPropertyModal');
    modal.style.display = 'block';
    // Force a reflow to ensure the modal renders at correct size before animation
    void modal.offsetWidth;
    
    // Set up input formatting for edit form
    setupEditFormInputFormatting();
    
    // Set up down payment sync for edit form
    setupEditFormDownPaymentSync();
    
    // Set up management fee sync for edit form
    setupEditFormManagementFeeSync();
}

function closeEditPropertyModal() {
    document.getElementById('editPropertyModal').style.display = 'none';
    document.body.classList.remove('modal-open');
    document.documentElement.style.removeProperty('--scrollbar-width');
    currentEditingPropertyId = null;
    
    // Reset form
    document.getElementById('editPropertyForm').reset();
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('editPropertyModal');
    if (event.target === modal) {
        closeEditPropertyModal();
    }
});

// Handle edit form submission
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editPropertyForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentEditingPropertyId) {
                alert('No property selected for editing');
                return;
            }
            
            // Get all input values and parse formatted numbers
            const propertyName = document.getElementById('editPropertyName').value.trim() || 'Unnamed Property';
            const purchasePrice = parseFormattedNumber(document.getElementById('editPurchasePrice').value);
            const downPayment = parseFormattedNumber(document.getElementById('editDownPayment').value);
            const interestRate = parseFormattedNumber(document.getElementById('editInterestRate').value);
            const loanTerm = parseFormattedNumber(document.getElementById('editLoanTerm').value);
            const monthlyRent = parseFormattedNumber(document.getElementById('editMonthlyRent').value);
            const propertyTaxes = parseFormattedNumber(document.getElementById('editPropertyTaxes').value);
            const insurance = parseFormattedNumber(document.getElementById('editInsurance').value);
            const maintenance = parseFormattedNumber(document.getElementById('editMaintenance').value) || 0;
            const hoaFees = parseFormattedNumber(document.getElementById('editHoaFees').value) || 0;
            const utilities = parseFormattedNumber(document.getElementById('editUtilities').value) || 0;
            const managementFee = parseFormattedNumber(document.getElementById('editManagementFee').value) || 0;
            const managementFeePercent = parseFormattedNumber(document.getElementById('editManagementFeePercent').value) || 0;
            const vacancyRate = parseFormattedNumber(document.getElementById('editVacancyRate').value) || 0;
            const appreciationRate = parseFormattedNumber(document.getElementById('editAppreciationRate').value) || 0;
            const rentGrowth = parseFormattedNumber(document.getElementById('editRentGrowth').value) || 0;
            const holdingPeriod = parseFormattedNumber(document.getElementById('editHoldingPeriod').value) || 1;
            
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
            
            // Recalculate all results using the same calculation logic
            const loanAmount = purchasePrice - downPayment;
            const monthlyMortgage = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
            const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate / 100);
            const monthlyPropertyTaxes = propertyTaxes / 12;
            const monthlyInsurance = insurance / 12;
            const monthlyMaintenance = effectiveMonthlyRent * (maintenance / 100);
            const monthlyManagementFee = managementFee > 0 ? managementFee : (effectiveMonthlyRent * (managementFeePercent / 100));
            const monthlyHOA = hoaFees;
            const monthlyUtilities = utilities;
            const totalMonthlyExpenses = monthlyMortgage + monthlyPropertyTaxes + 
                                     monthlyInsurance + monthlyMaintenance + monthlyManagementFee + monthlyHOA + monthlyUtilities;
            const monthlyCashFlow = effectiveMonthlyRent - totalMonthlyExpenses;
            const annualCashFlow = monthlyCashFlow * 12;
            const totalCashInvested = downPayment;
            const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100;
            const annualMaintenance = effectiveMonthlyRent * 12 * (maintenance / 100);
            const annualHOA = hoaFees * 12;
            const annualUtilities = utilities * 12;
            const annualManagementFee = managementFee > 0 ? (managementFee * 12) : (effectiveMonthlyRent * 12 * managementFeePercent / 100);
            const annualOperatingExpenses = propertyTaxes + insurance + annualMaintenance + annualHOA + annualUtilities + annualManagementFee;
            const annualGrossIncome = effectiveMonthlyRent * 12;
            const noi = annualGrossIncome - annualOperatingExpenses;
            const capRate = (noi / purchasePrice) * 100;
            const futureValue = purchasePrice * Math.pow(1 + appreciationRate / 100, holdingPeriod);
            const equityGain = futureValue - purchasePrice;
            
            let totalCashFlowOverPeriod = 0;
            if (rentGrowth > 0) {
                for (let year = 1; year <= holdingPeriod; year++) {
                    const yearRent = monthlyRent * Math.pow(1 + rentGrowth / 100, year - 1);
                    const yearEffectiveRent = yearRent * (1 - vacancyRate / 100);
                    const yearMonthlyMaintenance = yearEffectiveRent * (maintenance / 100);
                    const yearMonthlyManagementFee = managementFee > 0 ? managementFee : (yearEffectiveRent * (managementFeePercent / 100));
                    const yearMonthlyExpenses = monthlyMortgage + monthlyPropertyTaxes + 
                                               monthlyInsurance + yearMonthlyMaintenance + 
                                               yearMonthlyManagementFee + monthlyHOA + monthlyUtilities;
                    const yearCashFlow = (yearEffectiveRent - yearMonthlyExpenses) * 12;
                    totalCashFlowOverPeriod += yearCashFlow;
                }
            } else {
                totalCashFlowOverPeriod = annualCashFlow * holdingPeriod;
            }
            
            const totalReturn = totalCashFlowOverPeriod + equityGain;
            const totalROI = (totalReturn / totalCashInvested) * 100;
            
            // Update the property in localStorage
            let savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
            const propertyIndex = savedProperties.findIndex(p => p.id === currentEditingPropertyId);
            
            if (propertyIndex !== -1) {
                // Preserve tags and savedAt timestamp
                const existingTags = savedProperties[propertyIndex].tags || [];
                const savedAt = savedProperties[propertyIndex].savedAt;
                
                savedProperties[propertyIndex] = {
                    id: currentEditingPropertyId,
                    propertyName: propertyName,
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
                    tags: existingTags,
                    savedAt: savedAt,
                    timestamp: new Date().toISOString()
                };
                
                localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
                
                // Store the property ID before reloading
                const editedPropertyId = currentEditingPropertyId;
                
                // Close the modal first
                closeEditPropertyModal();
                
                // Reload the properties list to show updated data and keep the edited card expanded
                loadSavedProperties(editedPropertyId);
            }
        });
    }
});

// Set up input formatting for edit form
function setupEditFormInputFormatting() {
    const numberInputs = [
        'editPurchasePrice', 'editDownPayment', 'editDownPaymentPercent', 'editInterestRate', 'editLoanTerm',
        'editMonthlyRent', 'editPropertyTaxes', 'editInsurance', 'editMaintenance',
        'editHoaFees', 'editUtilities', 'editManagementFee', 'editManagementFeePercent', 'editVacancyRate', 
        'editAppreciationRate', 'editRentGrowth', 'editHoldingPeriod'
    ];
    
    const percentageFields = ['editDownPaymentPercent', 'editInterestRate', 'editMaintenance', 
                              'editManagementFeePercent', 'editVacancyRate', 'editAppreciationRate', 'editRentGrowth'];
    
    numberInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            const isPercentage = percentageFields.includes(inputId);
            
            input.addEventListener('blur', function() {
                const value = this.value;
                if (value) {
                    if (isPercentage) {
                        const num = parseFloat(value);
                        if (!isNaN(num)) {
                            this.value = num.toFixed(2).replace(/\.?0+$/, '');
                        }
                    } else {
                        this.value = formatNumberWithCommas(value);
                    }
                }
            });
            
            if (!isPercentage) {
                input.addEventListener('input', function() {
                    const cursorPos = this.selectionStart;
                    const valueBeforeCursor = this.value.substring(0, cursorPos);
                    const digitsBeforeCursor = valueBeforeCursor.replace(/,/g, '').length;
                    
                    const formatted = formatNumberWithCommas(this.value);
                    
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
                    
                    this.value = formatted;
                    this.setSelectionRange(newCursorPos, newCursorPos);
                });
            }
        }
    });
}

// Set up down payment synchronization for edit form
function setupEditFormDownPaymentSync() {
    const downPaymentInput = document.getElementById('editDownPayment');
    const downPaymentPercentInput = document.getElementById('editDownPaymentPercent');
    const purchasePriceInput = document.getElementById('editPurchasePrice');
    
    if (!downPaymentInput || !downPaymentPercentInput || !purchasePriceInput) return;
    
    function formatPercent(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        return num.toFixed(2).replace(/\.?0+$/, '');
    }
    
    downPaymentInput.addEventListener('input', function() {
        const purchasePrice = parseFormattedNumber(purchasePriceInput.value);
        const downPayment = parseFormattedNumber(this.value);
        
        if (!isNaN(purchasePrice) && !isNaN(downPayment) && purchasePrice > 0) {
            const percent = (downPayment / purchasePrice) * 100;
            downPaymentPercentInput.value = formatPercent(percent);
        }
    });
    
    downPaymentPercentInput.addEventListener('input', function() {
        const purchasePrice = parseFormattedNumber(purchasePriceInput.value);
        const percent = parseFormattedNumber(this.value);
        
        if (!isNaN(purchasePrice) && !isNaN(percent) && purchasePrice > 0) {
            const dollarValue = (purchasePrice * percent) / 100;
            downPaymentInput.value = formatNumberWithCommas(dollarValue);
        }
    });
    
    purchasePriceInput.addEventListener('input', function() {
        const purchasePrice = parseFormattedNumber(this.value);
        const downPayment = parseFormattedNumber(downPaymentInput.value);
        
        if (!isNaN(purchasePrice) && !isNaN(downPayment) && purchasePrice > 0 && downPayment > 0) {
            const percent = (downPayment / purchasePrice) * 100;
            downPaymentPercentInput.value = formatPercent(percent);
        }
    });
}

// Set up management fee synchronization for edit form
function setupEditFormManagementFeeSync() {
    const managementFeeInput = document.getElementById('editManagementFee');
    const managementFeePercentInput = document.getElementById('editManagementFeePercent');
    const monthlyRentInput = document.getElementById('editMonthlyRent');
    
    if (!managementFeeInput || !managementFeePercentInput || !monthlyRentInput) return;
    
    function formatPercent(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        return num.toFixed(2).replace(/\.?0+$/, '');
    }
    
    managementFeeInput.addEventListener('input', function() {
        const monthlyRent = parseFormattedNumber(monthlyRentInput.value);
        const managementFee = parseFormattedNumber(this.value);
        
        if (!isNaN(monthlyRent) && !isNaN(managementFee) && monthlyRent > 0) {
            const percent = (managementFee / monthlyRent) * 100;
            managementFeePercentInput.value = formatPercent(percent);
        }
    });
    
    managementFeePercentInput.addEventListener('input', function() {
        const monthlyRent = parseFormattedNumber(monthlyRentInput.value);
        const percent = parseFormattedNumber(this.value);
        
        if (!isNaN(monthlyRent) && !isNaN(percent) && monthlyRent > 0) {
            const dollarValue = (monthlyRent * percent) / 100;
            const roundedValue = Math.round(dollarValue * 100) / 100;
            managementFeeInput.value = formatNumberWithCommas(roundedValue);
        }
    });
    
    monthlyRentInput.addEventListener('input', function() {
        const monthlyRent = parseFormattedNumber(this.value);
        const managementFee = parseFormattedNumber(managementFeeInput.value);
        
        if (!isNaN(monthlyRent) && !isNaN(managementFee) && monthlyRent > 0 && managementFee > 0) {
            const percent = (managementFee / monthlyRent) * 100;
            managementFeePercentInput.value = formatPercent(percent);
        }
    });
}

// Make functions available globally for onclick handlers
window.deleteProperty = deleteProperty;
window.togglePropertyCard = togglePropertyCard;
window.editPropertyName = editPropertyName;
window.updateBulkActions = updateBulkActions;
window.editPropertyTags = editPropertyTags;
window.showAddTagInput = showAddTagInput;
window.hideAddTagInput = hideAddTagInput;
window.addTagToProperty = addTagToProperty;
window.deleteTag = deleteTag;
window.deleteTagByIndex = deleteTagByIndex;
window.toggleFilterTag = toggleFilterTag;
window.clearFilter = clearFilter;
window.applySorting = applySorting;
window.toggleSortDirection = toggleSortDirection;
window.toggleTagsDropdown = toggleTagsDropdown;
window.addTagToInput = addTagToInput;
window.editProperty = editProperty;
window.closeEditPropertyModal = closeEditPropertyModal;

// Make functions available globally for onclick handlers
window.deleteProperty = deleteProperty;
window.togglePropertyCard = togglePropertyCard;
window.editPropertyName = editPropertyName;
window.updateBulkActions = updateBulkActions;
window.editPropertyTags = editPropertyTags;
window.showAddTagInput = showAddTagInput;
window.hideAddTagInput = hideAddTagInput;
window.addTagToProperty = addTagToProperty;
window.deleteTag = deleteTag;
window.deleteTagByIndex = deleteTagByIndex;
window.toggleFilterTag = toggleFilterTag;
window.clearFilter = clearFilter;
window.applySorting = applySorting;
window.toggleSortDirection = toggleSortDirection;
window.toggleTagsDropdown = toggleTagsDropdown;
window.addTagToInput = addTagToInput;

// Days Calculator Functions
let currentCalendarDate = new Date();
let selectedDate = null;

function initializeDaysCalculator() {
    const dateInput = document.getElementById('targetDate');
    if (dateInput) {
        // Clear field on focus
        dateInput.addEventListener('focus', function() {
            this.select();
        });
        
        // Auto-format with slashes as user types
        dateInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, ''); // Remove all non-digits
            
            // Format as MM/DD/YYYY
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = value;
                } else if (value.length <= 4) {
                    value = value.substring(0, 2) + '/' + value.substring(2);
                } else {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
                }
            }
            
            // Update the input value
            this.value = value;
            
            // If we have a complete date (MM/DD/YYYY), parse and calculate
            if (value.length === 10) {
                const parsedDate = parseDateInput(value);
                if (parsedDate) {
                    selectedDate = parsedDate;
                    calculateDays(parsedDate);
                    updateCalendar();
                }
            }
        });
    }
    
    // Set up month and year dropdown event listeners once
    const monthSelect = document.getElementById('calendarMonthSelect');
    const yearSelect = document.getElementById('calendarYearSelect');
    
    if (monthSelect) {
        monthSelect.addEventListener('change', function() {
            currentCalendarDate.setMonth(parseInt(this.value));
            updateCalendar();
        });
    }
    
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            currentCalendarDate.setFullYear(parseInt(this.value));
            updateCalendar();
        });
    }
}

function updateCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const monthSelect = document.getElementById('calendarMonthSelect');
    const yearSelect = document.getElementById('calendarYearSelect');
    if (!calendarDays) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update month dropdown
    if (monthSelect) {
        monthSelect.innerHTML = '';
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        monthNames.forEach((name, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = name;
            if (index === month) option.selected = true;
            monthSelect.appendChild(option);
        });
    }
    
    // Update year dropdown
    if (yearSelect) {
        yearSelect.innerHTML = '';
        const currentYear = new Date().getFullYear();
        // Show 100 years range (50 years before and after current year)
        for (let y = currentYear - 50; y <= currentYear + 50; y++) {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = y;
            if (y === year) option.selected = true;
            yearSelect.appendChild(option);
        }
    }
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    calendarDays.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const isOtherMonth = currentDate.getMonth() !== month;
        const isToday = currentDate.getTime() === today.getTime();
        const isSelected = selectedDate && currentDate.getTime() === selectedDate.getTime();
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (isOtherMonth) dayElement.classList.add('other-month');
        if (isToday) dayElement.classList.add('today');
        if (isSelected) dayElement.classList.add('selected');
        dayElement.textContent = currentDate.getDate();
        dayElement.addEventListener('click', function() {
            selectedDate = new Date(currentDate);
            selectedDate.setHours(0, 0, 0, 0);
            const dateInput = document.getElementById('targetDate');
            if (dateInput) {
                const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const d = String(selectedDate.getDate()).padStart(2, '0');
                const y = selectedDate.getFullYear();
                dateInput.value = `${m}/${d}/${y}`;
            }
            calculateDays(selectedDate);
            updateCalendar();
            closeCalendarModal();
        });
        calendarDays.appendChild(dayElement);
    }
}

window.jumpToToday = function() {
    const today = new Date();
    currentCalendarDate = new Date(today);
    updateCalendar();
}

function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    updateCalendar();
}

function calculateDays(targetDate) {
    const resultDiv = document.getElementById('daysResult');
    const resultLabel = document.getElementById('resultLabel');
    const resultValue = document.getElementById('resultValue');
    if (!resultDiv || !resultLabel || !resultValue) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        resultLabel.textContent = 'Today:';
        resultValue.textContent = '0';
    } else if (diffDays > 0) {
        resultLabel.textContent = 'Days Until:';
        resultValue.textContent = diffDays.toString();
    } else {
        resultLabel.textContent = 'Days Since:';
        resultValue.textContent = Math.abs(diffDays).toString();
    }
    resultDiv.style.display = 'block';
}

function parseDateInput(dateString) {
    if (!dateString) return null;
    const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(mmddyyyy);
    if (match) {
        const month = parseInt(match[1], 10) - 1;
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        const date = new Date(year, month, day);
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
            return date;
        }
    }
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }
    return null;
}

window.toggleCalendar = function() {
    const calendarPicker = document.getElementById('calendarPicker');
    const overlay = document.getElementById('calendarPickerOverlay');
    if (!calendarPicker || !overlay) return;
    const isOpen = calendarPicker.classList.contains('show');
    if (!isOpen) {
        updateCalendar();
        calendarPicker.classList.add('show');
        overlay.classList.add('show');
    } else {
        closeCalendarModal();
    }
}

window.closeCalendarModal = function() {
    const calendarPicker = document.getElementById('calendarPicker');
    const overlay = document.getElementById('calendarPickerOverlay');
    if (calendarPicker) calendarPicker.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', function() {
    const homePage = document.getElementById('home-master-page');
    const realEstatePage = document.getElementById('real-estate-roi-master-page');
    if (homePage) homePage.classList.add('active');
    if (realEstatePage) realEstatePage.classList.remove('active');
    // Initialize calendar scrollbar width variable to 0
    document.documentElement.style.setProperty('--calendar-scrollbar-width', '0px');
    initializeDaysCalculator();
    
    // Set up master menu event listeners
    const hamburgerBtn = document.getElementById('hamburgerMenuBtn');
    const overlay = document.getElementById('masterMenuOverlay');
    const closeBtn = document.querySelector('.master-menu-close');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', window.toggleMasterMenu);
    }
    if (overlay) {
        overlay.addEventListener('click', window.toggleMasterMenu);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', window.toggleMasterMenu);
    }
});
