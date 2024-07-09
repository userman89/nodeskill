/* eslint-disable-next-line */
/* global Vue */

document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    el: '#app',
    data: {
      desc: '',
      activeTimers: [],
      oldTimers: []
    },
    methods: {
      // ... ваши существующие методы ...

      updateTimersUI(timers) {
        const currentTime = new Date().getTime();
        this.activeTimers = timers.filter(timer => timer.isActive).map(timer => {
          timer.elapsedTime = currentTime - new Date(timer.start).getTime();
          return timer;
        });
        this.oldTimers = timers.filter(timer => !timer.isActive);
      }
    },
    created() {
      // Подключение к WebSocket
      const ws = new WebSocket('ws://localhost:3000'); // Исправьте адрес WebSocket, если нужно

      ws.onmessage = (event) => {
        const timers = JSON.parse(event.data);
        this.updateTimersUI(timers); 
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      // Инициализация таймеров при загрузке
      fetch('/timer/update', {
        headers: {
          'Authorization': `Bearer ${window.AUTH_TOKEN}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error fetching timers');
        }
      })
      .then(data => {
        this.updateTimersUI(data.timers);
      })
      .catch(error => {
        console.error('Error fetching timers:', error);
      });
    }
  });
});
