<template>
    <enso-form class="box has-background-light"
        :path="path"
        :params="params"
        :key="key"
        @loaded="setFields"
        v-bind="$attrs"
        disable-state
        ref="form">
        <template #actions-left
            v-if="canLocalize">
            <a class="button is-warning"
                :class="{'loading': loading}"
                @click="localize">
                <span class="is-hidden-mobile">
                    {{ i18n('Localize') }}
                </span>
                <span class="icon">
                    <fa icon="map-pin"/>
                </span>
                <span class="is-hidden-mobile"/>
            </a>
        </template>
        <template #country_id="{ field: countryId }">
            <form-field :field="countryId"
                @update:model-value="reRender"/>
        </template>
        <template #postcode="{ field: postcodeField, errors }">
            <div class="is-fullwidth">
                <label class="label">
                    {{ i18n(postcodeField.label) }}
                </label>
                <div class="field has-addons">
                    <div class="control is-expanded">
                        <input class="input"
                            :class="['input', { 'is-danger': errors.has(postcodeField.name) }]"
                            type="text"
                            :placeholder="i18n(postcodeField.meta.placeholder)"
                            v-model="postcodeField.value"
                            @input="errors.clear(postcodeField.name)">
                    </div>
                    <div class="control"
                        v-if="canAccess('core.addresses.postcode')">
                        <a :class="['button', postcodeCss]"
                            @click="loadAddress">
                        <span class="icon">
                            <fa icon="search-location"/>
                        </span>
                        </a>
                    </div>
                </div>
                <p class="help is-danger"
                    v-if="errors.has(postcodeField.name)">
                    {{ errors.get(postcodeField.name) }}
                </p>
            </div>
        </template>
        <template #region_id="{ field: regionId, errors }">
            <form-field :field="regionId"
                @update:model-value="
                    localityParams.region_id = $event;
                    errors.clear(regionId.name);
                "/>
        </template>
        <template #locality_id="{ field: localityId, errors }"
            v-if="form">
            <form-field :field="localityId"
                :params="localityParams"
                @selection="form.field('sector_id').meta.hidden = !$event || !$event.hasSectors;"
                @update:model-value="
                    sectorParams.locality_id = $event;
                    form.field('sector_id').value = null
                    errors.clear(localityId.name)
                "/>
        </template>
        <template #sector_id="{ field: sectorId, errors }">
            <form-field :field="sectorId"
                :params="sectorParams"
                @update:model-value="errors.clear(sectorId.name)"/>
        </template>
    </enso-form>
</template>

<script setup>
import {

    defineProps, defineEmits, inject, ref, reactive, computed, nextTick, defineOptions,
} from 'vue';
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLocationArrow, faMapPin, faSearchLocation } from '@fortawesome/free-solid-svg-icons';

import { EnsoForm, FormField } from '@enso-ui/forms/bulma';

library.add(faLocationArrow, faMapPin, faSearchLocation);

defineOptions({ inheritAttrs: false });

const canAccess = inject('canAccess');
const errorHandler = inject('errorHandler');
const http = inject('http');
const i18n = inject('i18n');
const route = inject('route');

const props = defineProps({
    addressableId: {
        type: [String, Number],
        required: true,
    },
    id: {
        type: [Number, null],
        default: null,
    },
    type: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['form-loaded']);

const key = ref(1);
const form = ref(null);
const loading = ref(false);
const postcode = ref(null);

const params = reactive({ countryId: null });
const localityParams = reactive({ region_id: null });
const sectorParams = reactive({ locality_id: null });

const canLocalize = computed(() => form.value && form.value.routeParam('address')
        && canAccess('core.addresses.localize'));

const path = computed(() => (props.id
    ? route('core.addresses.edit', props.id)
    : route('core.addresses.create', params)));
const postcodeCss = computed(() => {
    if (postcode.value === null) {
        return 'is-info';
    }

    return postcode.value
        ? 'is-success'
        : 'is-danger';
});

const localize = () => {
    loading.value = true;
    const address = form.value.routeParam('address');

    http.get(route('core.addresses.localize', address))
        .then(({ data }) => {
            const { lat, long } = data;
            form.value.field('lat').value = lat;
            form.value.field('long').value = long;
        }).catch(errorHandler)
        .finally(() => (loading.value = false));
};

const reRender = countryId => {
    params.countryId = countryId;
    key.value++;
};

const setFields = () => {
    form.value.field('addressable_id').value = props.addressableId;
    form.value.field('addressable_type').value = props.type;
    localityParams.region_id = form.value.field('region_id').value;
    sectorParams.locality_id = form.value.field('locality_id').value;
    emit('form-loaded', form);
};

const loadAddress = () => {
    loading.value = true;
    postcode.value = null;

    const params = {
        params: {
            postcode: form.value.field('postcode').value,
            country_id: form.value.field('country_id').value,
        },
    };

    http.get(route('core.addresses.postcode'), params)
        .then(({ data: { postcode } }) => {
            ['lat', 'long', 'city', 'region_id', 'locality_id', 'street']
                .forEach(key => (form.value.field(key).value = postcode[key]
                || form.value.field(key).value));
            postcode.value = true;
        }).catch(error => {
            const { status, data } = error.response;
            postcode.value = false;

            if (status === 422) {
                form.value.errors.set(data.errors);
                nextTick(() => form.value.focusError);
            } else {
                errorHandler(error);
            }
        }).finally(() => (loading.value = false));
};

</script>
