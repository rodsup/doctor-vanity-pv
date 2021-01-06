"use strict";

window.addEventListener('DOMContentLoaded', function (event) {

  var api = axios.create({
    baseURL: 'http://localhost:3333'
  });

  document.getElementById('formEmail').addEventListener('submit', async function (e) {
    e.preventDefault();
    var name = document.getElementById('inputName');
    var email = document.getElementById('inputEmail');
    var phone = document.getElementById('inputPhone');
    var message = document.getElementById('inputMessage');

    if (name.value === '' || email.value === '' || phone.value === '' || phone.value.length < 14 || phone.value === '' || message.value === '') {
      alert('É necessário que todos os campos estejam preenchidos para o envio de uma mensagem.');
      return;
    }

    var response = await api.post('sendEmail', {
      name: name.value,
      email: email.value,
      phone: phone.value,
      message: message.value
    });

    if (response.status == 200 || response.status === 201) {
      name.value = '';
      email.value = '';
      phone.value = '';
      message.value = '';
      alert(response.data.message);
    }
  });

  $("#inputPhone").mask("(99) 9999-99999");
});