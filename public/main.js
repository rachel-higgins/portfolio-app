'use strict';

document.addEventListener('DOMContentLoaded', function () {

   function downloadRow(person) {
      const staffData = document.getElementById('staffData');

      staffData.innerHTML += `
      <tr>
         <td><img src="${person.picture.thumbnail}" alt="Thumbnail"></td>
         <td>
            <a href="mailto:${person.email}">
               ${person.name.first} ${person.name.last}
            </a>
         </td>
         <td class="center">${person.phone}</td>
         <td class="center">${person.location.timezone.description}</td>
      </tr>
      `;
   }

   // Handle Events ----------------
   async function fetchPerson(evt) {
      const errMessage = 'API call failed.';
      const okMessage = 'API has been called.';

      evt.preventDefault();
      const apiUrl = 'https://randomuser.me/api/';
      try {
         const response = await fetch(apiUrl);
         const data = await response.json();
         downloadRow(data.results[0]);
         console.log(data);
         document.getElementById('online').innerHTML = okMessage;
      } catch (error) {
         console.error(error);
         document.getElementById('offline').innerHTML = errMessage;
      }
   }

   // Event Listener ---------------
   const buttonRequestAppend = document.getElementById('generateStaff');
   buttonRequestAppend.addEventListener('click', fetchPerson);
});
