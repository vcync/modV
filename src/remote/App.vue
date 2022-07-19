<template>
  <main>
    <h1>remote, hi!</h1>
    <ul>
      <li v-for="(message, i) in messages" :key="i">
        {{ message[0] }}:
        <pre>{{ message[1] }}</pre>
      </li>
    </ul>
  </main>
</template>

<script>
export default {
  data() {
    return {
      messages: []
    };
  },

  mounted() {
    const ws = new WebSocket(`ws://${location.host}`);
    ws.addEventListener("message", ({ data: dataString }) => {
      const { type, payload } = JSON.parse(dataString);
      this.messages.push([type, payload]);
    });

    ws.addEventListener("open", () => {
      // ws.send('hello')
    });
  }
};
</script>
