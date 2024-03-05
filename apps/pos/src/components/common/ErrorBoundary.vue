<script lang="ts">
export default {
  name: 'ErrorBoundary',
  data() {
    return {
      error: false
    }
  },
  errorCaptured(err, vm, info) {
    console.log(err, info)
    this.error = true
  },
  render(h: any) {
    // @ts-ignore
    return this.error ? h('p', 'Something went wrong') : this.$slots.default()
  }
}
</script>
