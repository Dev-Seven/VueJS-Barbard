<template>
  <v-select
    :label="label"
    variant="filled"
    :items="items.barbers"
    :multiple="isMultiple"
    v-model="selected"
  >
    <template v-slot:append-inner>
      <img :src="Down" class="custom-down-icon" />
    </template>
    <template v-slot:prepend-inner v-if="isFilter">
      <img :src="Filter" />
    </template>
    <template v-slot:item="{ props, item }" v-if="isMultiple">
      <div
        v-bind="props"
        class="custom-container cursor-pointer flex flex-col gap-y-2"
      >
        <div class="flex justify-between">
          <div class="flex items-center gap-x-3">
            <img :src="User" class="user-image" />
            <div>
              <p class="text-base uppercase golden-text">
                {{ item.raw.fullName }}
              </p>
              <p class="text-[0.687rem] font-montserrat uppercase text-white">
                {{ item.raw.nickName }}
                <!-- the artist -->
              </p>
            </div>
          </div>
          <img
            :src="
              selected.find((item1) => item1.id == item.raw.id)
                ? Checked
                : UnChecked
            "
          />
        </div>
        <hr class="opacity-60 py-0 my-0" />
      </div>
    </template>
    <template v-slot:selection="{ item, index }" v-if="isMultiple">
      <p class="text-[0.8rem]" v-if="index < 1">{{ item.raw.fullName }}</p>
      <span v-if="index === 1" class="text-grey text-caption align-self-center">
        (+{{ selected.length - 1 }} others)
      </span>
    </template>
  </v-select>
</template>

<script setup>
import Down from "@/assets/svg/icons/down.svg";
import Filter from "@/assets/svg/icons/filter.svg";
import User from "@/assets/images/user1.png";
import UnChecked from "@/assets/svg/icons/unChecked.svg";
import Checked from "@/assets/svg/icons/checked.svg";

const {
  items,
  label,
  isFilter = false,
  isMultiple = false,
} = defineProps(["items", "label", "isFilter", "isMultiple"]);

const emit = defineEmits(["selected"]);

const selected = ref(items.barbers);

watch(items, () => {
  selected.value = items.barbers;
});

watch(selected, () => {
  emit("selected", selected);
});
</script>

<style lang="scss" scoped>
.custom-container {
  padding: 0.75rem 0.75rem 0 0.75rem;
  background: rgba(78, 75, 97, 0.7);
}
.user-image {
  height: 3rem;
  width: 3rem;
  border-radius: 2.5rem;
  border: 1px solid #736144;
}
</style>
