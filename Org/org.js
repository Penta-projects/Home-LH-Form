import { database, ref, set, get, update, remove, onValue, child, push } from '../Script/firebase.js';

// Add event listener to the submit button
const submitButton = document.querySelector('#submit-btn');



submitButton.addEventListener('click', () => {
    // Fetch form values
    const name = document.querySelector('.name-lable input').value;
    const startDate = document.querySelector('.date-lable .start-date').value;
    const endDate = document.querySelector('.date-lable .end-date').value;
    const noEmploy = document.querySelector('.employ-lable input').value;
    const noRoomReserved = document.querySelector('.noRoomReserved input').value;
    const noEmployRoomReserve = document.querySelector('.noEmployRoomReserve input').value;

    // Identify selected room
    let selectedRoom = null;
    ['floor1', 'floor2', 'floor3', 'floor4'].forEach(floor => {
        const checkedRoom = document.querySelector(`input[name="${floor}"]:checked`);
        if (checkedRoom) selectedRoom = checkedRoom.value;
    });
    selectedRoom = selectedRoom || 'No room selected';


    const timestamp = Date.now();
    // Create a Date object
        const date = new Date(timestamp);

        // Convert to Ethiopian time (UTC+3)
        const options = {
            timeZone: 'Africa/Addis_Ababa',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        // Format the date to Ethiopian time
    const ethiopianTime = new Intl.DateTimeFormat('en-US', options).format(date);


        
    const userData = {
        name: name,
        startDate: startDate,
        endDate: endDate,
        noEmploy: noEmploy,
        noRoomReserved: noRoomReserved,
        noEmployRoomReserve: noEmployRoomReserve
    }

    showRemovePopup(userData);


    document.getElementById('confirmRemoveBtn').addEventListener('click', ()=>{

        const password = document.getElementById('passwordInput').value;

        if (password === '1234') {
            // Push data to Firebase Realtime Database
            const customerRef = ref(database, 'customers');
            const newCustomerRef = push(customerRef); // Creates a new unique entry
            const customerKey = name.replace(/\s+/g, '_'); 

            const userRef = ref(database, `organisation_room/${customerKey}`);

            const timestamp = Date.now();
        // Create a Date object
            const date = new Date(timestamp);

            // Convert to Ethiopian time (UTC+3)
            const options = {
                timeZone: 'Africa/Addis_Ababa',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };

            // Format the date to Ethiopian time
            const ethiopianTime = new Intl.DateTimeFormat('en-US', options).format(date);

            let selectedRoom = null;
            ['floor1', 'floor2', 'floor3', 'floor4'].forEach(floor => {
                const checkedRoom = document.querySelector(`input[name="${floor}"]:checked`);
                if (checkedRoom) selectedRoom = checkedRoom.value;
            });
        
            if (selectedRoom && selectedRoom !== 'No room selected') {
                updateRoomStatus(selectedRoom);
            }

            
            set(userRef, userData)
            .then(() => {
                alert('Customer information submitted successfully!');
                // Optionally clear the form
                document.querySelectorAll('input').forEach(input => input.value = '');
                document.querySelector('#sex-options').value = 'None';
            })
            .catch((error) => {
                console.error('Error saving data: ', error);
                alert('Failed to submit customer information!');
            });

        }
        else {
            alert('Incorrect password. Please try again.');
        }
    });

});

// Real-time Listener for Room Availability
const roomStatusRef = ref(database, 'rooms');
onValue(roomStatusRef, (snapshot) => {
    const roomsData = snapshot.val();
    if (roomsData) {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (roomsData[radio.value] === 'booked') {
                radio.disabled = true;
                radio.closest('li').classList.add('booked');
                radio.closest('li').style.color = 'grey';
            } else {
                radio.disabled = false;
                radio.closest('li').style.color = 'black';
            }
        });
    }
});

// Update Room Status After Booking
function updateRoomStatus(roomNumber) {
    if (roomNumber && roomNumber !== 'No room selected') {
        const roomRef = ref(database, `rooms/${roomNumber}`);
        set(roomRef, 'booked')
        .then(() => {
            console.log(`Room ${roomNumber} marked as booked.`);
        })
        .catch((error) => {
            console.error('Error updating room status: ', error);
        });
    }
}




// rooms price

window.addEventListener('DOMContentLoaded', (event) => {
    // Function to get room pricing from Firebase
    const getRoomPricing = async () => {
        try {
            // Get the roomPricing data from the Firebase database
            const roomPricingRef = ref(database, 'roomPricing');
            const snapshot = await get(roomPricingRef);

            if (snapshot.exists()) {
                const roomPricing = snapshot.val();
                updateRoomPrices(roomPricing);
            } else {
                console.log('No room pricing data available');
            }
        } catch (error) {
            console.error('Error fetching room pricing:', error);
        }
    };

    // Function to update room prices in the DOM
    const updateRoomPrices = (roomPricing) => {
        // Select all h3 elements that represent room types
        const roomTypes = document.querySelectorAll('h4');

        roomTypes.forEach((roomTypeElement) => {
            const roomTypeClass = roomTypeElement.className.toLowerCase().split('-')[0]; // Get the room type from the class name
            const priceElement = roomTypeElement.nextElementSibling?.nextElementSibling; // Safe navigation using optional chaining

            // Ensure priceElement exists and update the price
            if (priceElement && roomPricing[roomTypeClass]) {
                priceElement.textContent = roomPricing[roomTypeClass];
            } else if (priceElement) {
                priceElement.textContent = 'N/A'; // Default if no price found
            }
        });
    };

    // Fetch room pricing when the page loads
    getRoomPricing();
});



document.querySelectorAll('.floor-input').forEach(input => {
    input.addEventListener('change', () => {
        const nextElement = input.nextElementSibling;
        const nextTwo = nextElement.nextElementSibling;
        const priceElement = nextTwo.nextElementSibling?.nextElementSibling;
        let finalPrice;
        let finalDay;

        console.log(nextTwo); // Log the next sibling element of the input
        
        if (nextTwo && nextTwo.textContent.trim() === 'Deluxe') {
            console.log(nextTwo.nextElementSibling);
            console.log(priceElement)
            console.log(priceElement.textContent)

            document.querySelector('.amount-in-birr').textContent = priceElement.textContent;
            finalPrice = priceElement.textContent;

            const dayInputChange = document.querySelector('.days-lable input')
            document.querySelector('.answer').innerHTML = priceElement.textContent * dayInputChange.value;
        }

        else if (nextTwo && nextTwo.textContent.trim() === 'Standard') {
            console.log(nextTwo.nextElementSibling);
            console.log(priceElement)
            console.log(priceElement.textContent)

            document.querySelector('.amount-in-birr').textContent = priceElement.textContent;
            finalPrice = priceElement.textContent;
        
            const dayInputChange = document.querySelector('.days-lable input')
            document.querySelector('.answer').innerHTML = priceElement.textContent * dayInputChange.value;
        }
        else if (nextTwo && nextTwo.textContent.trim() === 'Single') {
            console.log(nextTwo.nextElementSibling);
            console.log(priceElement)
            console.log(priceElement.textContent)

            document.querySelector('.amount-in-birr').textContent = priceElement.textContent;
            finalPrice = priceElement.textContent;

            const dayInputChange = document.querySelector('.days-lable input')
            document.querySelector('.answer').innerHTML = priceElement.textContent * dayInputChange.value;
        }
        else if (nextTwo && nextTwo.textContent.trim() === 'Double') {
            console.log(nextTwo.nextElementSibling);
            console.log(priceElement)
            console.log(priceElement.textContent)

            document.querySelector('.amount-in-birr').textContent = priceElement.textContent;
            finalPrice = priceElement.textContent;

            const dayInputChange = document.querySelector('.days-lable input')
            document.querySelector('.answer').innerHTML = priceElement.textContent * dayInputChange.value;
        }


        const days = document.querySelector('.name-of-days');
        days.addEventListener('input', () => {
            // Get the value of the input
            const daysValue = days.value;
            
            // Set the innerHTML of the '.length-of-stay' element to the value of 'days'
            document.querySelector('.length-of-stay').innerHTML = daysValue;
        
            // Assuming 'finalPrice' is already defined somewhere
            finalDay = daysValue; // Store the input value
        
            // Assuming 'finalPrice' is a number, calculate the total answer
            document.querySelector('.answer').innerHTML = daysValue * finalPrice;
        });
        
    });
});





// Function to show the popup for password input
function showRemovePopup(userData) {
    const modal = document.getElementById('removeCustomerModal');
    modal.style.display = 'block';

    document.querySelector('.information-customer .name').innerHTML = userData.name;
    document.querySelector('.information-customer .age').innerHTML = userData.age;
    document.querySelector('.information-customer .date-of-birth').innerHTML = userData.dob;
    document.querySelector('.information-customer .final-date').innerHTML = userData.finalDate;
    document.querySelector('.information-customer .payment-method').innerHTML = userData.selectedPayment;
    document.querySelector('.information-customer .room').innerHTML = userData.selectedRoom;
    document.querySelector('.information-customer .Price').innerHTML = userData.amountInBirr;

    


    // Close the popup when cancel button is clicked
    document.getElementById('cancelRemoveBtn').onclick = () => {
        modal.style.display = 'none';
    };
}






// Get references to the input and container
const orgOfEmployInput = document.getElementById('org-of-employ');
const nameLabelContainer = document.getElementById('name-label-container');

// Listen for changes in the input field
orgOfEmployInput.addEventListener('input', () => {
    const numberOfLabels = parseInt(orgOfEmployInput.value) || 0; // Get the value or default to 0

    // Clear previous labels
    nameLabelContainer.innerHTML = '';

    // Generate new labels
    for (let i = 1; i <= numberOfLabels; i++) {
        const nameLabel = document.createElement('div');
        nameLabel.className = 'name-label';
        nameLabel.innerHTML = `   <h3 class="lable">የእንግዳ ስም</h1>
                <input type="text" placeholder="የእንግዳ ስም" class="org-of-customer">
                <input type="text" placeholder="Room Number" class="room-num">
           `;
        nameLabelContainer.appendChild(nameLabel);
    }
});
