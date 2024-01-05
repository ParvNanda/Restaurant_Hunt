document.addEventListener('DOMContentLoaded', function () {
    const addressForm = document.getElementById('addressForm');

    addressForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const addressInput = document.getElementById('address');
        const enteredAddress = addressInput.value;
        var prams={
            "userAddress": "Quadenstraße 5, 1200 Vienna"
        }
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `http://localhost:3000/getOutletId?userAddress=${enteredAddress}`,true);
        xhr.send();
        xhr.onload = () => {
          if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
            document.getElementById('answer').innerHTML=xhr.responseText
            
          } else {
            console.log(`Error: ${xhr.status}`);
          }
        };

        console.log('Entered Address:', enteredAddress);


        addressForm.reset();
    });
});