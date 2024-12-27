import { database, ref, set, get, update, remove, onValue, child, push } from '../Script/firebase.js';

// Reference to the database
const dbRef = ref(database);

// Function to load customers into their respective floors and rooms
function loadCustomers() {
    get(child(dbRef, 'customers'))
        .then((snapshot) => {
            if (snapshot.exists()) {
                // Clear existing room data
                document.querySelectorAll('.floors-div .floors ul').forEach(ul => ul.innerHTML = '');

                snapshot.forEach((childSnapshot) => {
                    const customer = childSnapshot.val();
                    const roomNumber = customer.selectedRoom;
                    const days = customer.days;
                    const finalDate = customer.finalDate;
                    const startingDate = customer.timestamp;
                    const paymentMethod = customer.paymentMethod;
                    const customerName = customer.name;
                    const customerId = childSnapshot.key; // Get the customer ID
                
                    let formattedDate = 'N/A';
                    let exittime = 'N/A';
                
                    // 🗓️ Validate and Process `finalDate`
                    if (finalDate && finalDate.includes('T')) {
                        const [date, time] = finalDate.split('T');
                        const [year, month, day] = date.split('-');
                
                        console.log({ year, month, day, time });
                
                        // 🕒 Validate and Process `startingDate`
                        if (startingDate && startingDate.includes(' at ')) {
                            try {
                                const [datePart, timePart] = startingDate.split(' at ');
                
                                const exitDate = new Date(datePart);
                                if (isNaN(exitDate)) {
                                    throw new Error('Invalid startingDate format');
                                }
                
                                const exitYear = exitDate.getFullYear();
                                const exitMonth = String(exitDate.getMonth() + 1).padStart(2, '0');
                                const exitDay = String(exitDate.getDate()).padStart(2, '0');
                
                                const [hours, minutes, seconds] = timePart.split(':');
                                const hour12 = parseInt(hours, 10) % 12 || 12;
                                const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
                                const formattedExitTime = `${hour12}:${minutes} ${ampm}`;
                
                                // 📊 Calculate Exit Time Difference
                                const currentDate = new Date(`${year}-${month}-${day}T${time}`);
                                const timeDiff = currentDate - exitDate;
                
                                const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                                const diffMonths = Math.floor(diffDays / 30); // Approximate month difference
                                const remainingDays = diffDays % 30;
                



                                
                                exittime = `${diffMonths} month(s), ${remainingDays} day(s), ${formattedExitTime}`;
                                formattedDate = `${month}-${day} <i class="fa-solid fa-arrow-right"></i> ${time}`;
                
                                console.log({
                                    exitYear,
                                    exitMonth,
                                    exitDay,
                                    exittime,
                                    formattedDate
                                });
                
                            } catch (error) {
                                console.error('Error processing startingDate:', error.message);
                            }
                        } else {
                            console.error('Invalid or missing startingDate');
                        }
                    } else {
                        console.error('Invalid or missing finalDate');
                    }
                
                    // 🏢 Determine Floor Based on Room Number
                    let floor;
                    if (roomNumber.startsWith('1')) floor = '.floors .floor-one ul';
                    else if (roomNumber.startsWith('2')) floor = '.floors .floor-two ul';
                    else if (roomNumber.startsWith('3')) floor = '.floors .floor-three ul';
                    else if (roomNumber.startsWith('4')) floor = '.floors .floor-four ul';
                
                    const floorElement = document.querySelector(floor);
                
                    if (floorElement) {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `
                            ${roomNumber} <i class="fa-solid fa-arrow-right"></i> ${customerName}
                            <i class="fa-solid fa-arrow-right fa-arrow-margin"></i>${days} Days
                            <i class="fa-solid fa-arrow-right"></i> ${paymentMethod}
                            <i class="fa-solid fa-arrow-right fa-arrow-margin"></i>
                            <span class="starting-date">${startingDate}</span>
                            <i class="fa-solid fa-arrow-right fa-arrow-margin"></i>
                            <span class="ending-date">${formattedDate}</span>
                            <span class="user-leaved"><i class="fa-solid fa-user-xmark"></i></span>
                            ${exittime}
                        `;
                        floorElement.appendChild(listItem);
                
                        // 🛎️ Event Listener for Removing User
                        listItem.querySelector('.user-leaved').addEventListener('click', () => {
                            showRemovePopup(customerId, roomNumber);
                        });
                    } else {
                        console.warn(`No floor found for room number: ${roomNumber}`);
                    }
                });
                

                
            } else {
                console.log('No customers found.');
            }
        })
        .catch((error) => {
            console.error('Error fetching customers:', error);
        });
}


// Function to show the popup for password input
function showRemovePopup(customerId, roomNumber) {
    const modal = document.getElementById('removeCustomerModal');
    modal.style.display = 'block';

    // Confirm remove action
    document.getElementById('confirmRemoveBtn').onclick = () => {
        const password = document.getElementById('passwordInput').value;

        if (password === '1234') {
            removeCustomer(customerId, roomNumber); // Pass roomNumber here
            modal.style.display = 'none'; // Close the popup
        } else {
            alert('Incorrect password. Please try again.');
        }
    };

    // Close the popup when cancel button is clicked
    document.getElementById('cancelRemoveBtn').onclick = () => {
        modal.style.display = 'none';
    };
}



// Function to remove the customer and their booked room
function removeCustomer(customerId, roomNumber) {
    // Reference to the customer and the room
    const customerRef = ref(database, 'customers/' + customerId);
    const roomRef = ref(database, 'rooms/' + roomNumber); // Reference to the room

    // Remove the room only once (after the customer is successfully removed)
    remove(customerRef)
        .then(() => {
            return remove(roomRef);  // Remove the room after the customer
        })
        .then(() => {
            console.log('Room and customer removed successfully');
            loadCustomers();  // Reload the customer list after removal
        })
        .catch((error) => {
            console.error('Error removing customer or room:', error);
        });
}





// Load customers on page load
window.onload = loadCustomers;
