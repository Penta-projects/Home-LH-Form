import { database, ref, set } from '../../Script/firebase.js';

// Reference to the database
const dbRef = ref(database);

// Handle Submit Button Click
document.getElementById('submit-change').addEventListener('click', () => {
    // Get values from inputs
    const deluxeAmount = document.querySelector('.deluxe-amount').value;
    const standardAmount = document.querySelector('.standard-amount').value;
    const singleAmount = document.querySelector('.single-amount').value;
    const doubleAmount = document.querySelector('.double-amount').value;

    // Validate Inputs
    if (!deluxeAmount || !standardAmount || !singleAmount || !doubleAmount) {
        alert('Please fill in all the amounts before submitting.');
        return;
    }

    // Prepare data to be saved
    const pricingData = {
        deluxe: parseFloat(deluxeAmount),
        standard: parseFloat(standardAmount),
        single: parseFloat(singleAmount),
        double: parseFloat(doubleAmount),
        timestamp: Date.now()
    };

    // Save data to Firebase under 'roomPricing'
    set(ref(database, 'roomPricing'), pricingData)
        .then(() => {
            alert('Pricing details saved successfully!');
            // Optionally clear the inputs
            document.querySelector('.deluxe-amount').value = '';
            document.querySelector('.standard-amount').value = '';
            document.querySelector('.single-amount').value = '';
            document.querySelector('.double-amount').value = '';
        })
        .catch((error) => {
            console.error('Error saving data:', error);
            alert('Failed to save pricing details. Please try again.');
        });
});
