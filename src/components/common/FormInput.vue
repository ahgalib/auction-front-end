<script setup defineProps>
defineProps({
    label: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'text',
    },
    placeholder: String,
    modelValue: {
        type: [String, Number],
        required: true,
    },
    error: String,
    disabled: Boolean,
});

defineEmits(['update:modelValue']);
</script>

<template>
    <div class="w-full">
        <label class="block text-sm font-semibold text-gray-800 mb-3">
            {{ label }}
        </label>
        <input
            :type="type"
            :placeholder="placeholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            :disabled="disabled"
            :class="[
                'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition duration-200',
                'text-gray-900 placeholder-gray-400 font-medium',
                error
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-white hover:border-gray-300 focus:border-indigo-500',
                disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : '',
            ]"
        />
        <p v-if="error" class="text-sm font-medium text-red-500 mt-2">{{ error }}</p>
    </div>
</template>
