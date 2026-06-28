Component({
  properties: {
    pet: { type: Object, value: {} }
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.pet.id });
    }
  }
});
