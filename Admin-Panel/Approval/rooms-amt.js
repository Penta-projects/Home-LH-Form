import { database, ref, set, update } from '../../Script/firebase.js';

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





document.getElementById('submit-change-rooms-detail').addEventListener('click', function () {
    // Get all selected radio buttons
    const selectedRooms = document.querySelectorAll('input[type="radio"]:checked');
    
    if (selectedRooms.length === 0) {
        alert('Please select at least one room before submitting.');
        return;
    }

    // Collect room details into an object
    const registeredRooms = {};

    selectedRooms.forEach(room => {
        const roomItem = room.closest('li'); // Find the closest li parent

        const roomNumber = room.value; // Get room number from radio button
        const roomTypeDropdown = roomItem.querySelector('.room-type'); // Get dropdown
        const roomAmountInput = roomItem.querySelector('.room'); // Get amount input

        // Add to object with roomNumber as key
        registeredRooms[roomNumber] = {
            roomNumber: roomNumber,
            roomType: roomTypeDropdown ? roomTypeDropdown.value : 'N/A',
            roomAmount: roomAmountInput ? roomAmountInput.value : 'N/A'
        };
    });

    // Update instead of set to prevent overwriting existing data
    update(ref(database, `eachRoomsPricing`), registeredRooms)
    .then(() => {
        alert(`Successfully registered ${Object.keys(registeredRooms).length} room(s). Check the console for details.`);
    })
    .catch((error) => {
        console.error('Error updating rooms:', error);
        alert('Failed to register rooms. Check the console for details.');
    });

    // Log registered rooms
    console.log('Registered Rooms:', registeredRooms);
});
