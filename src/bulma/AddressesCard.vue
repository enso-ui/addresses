<template>
    <card collapsible
        :collapsed="collapsed">
        <card-header>
            <template #title>
                <span class="icon is-small mr-1">
                    <fa :icon="icon"/>
                </span>
                {{ displayTitle }}
            </template>
            <template #controls>
                <card-refresh @refresh="fetch"/>
                <card-badge :label="count"/>
                <card-collapse/>
            </template>
        </card-header>
        <card-content class="p-0">
            <addresses :id="id"
                :type="type"
                :query="query"
                @update="count = $refs.addresses.count; $refs.card.resize()"
                ref="addresses"/>
        </card-content>
    </card>
</template>

<script>
import { faSignsPost } from '@fortawesome/free-solid-svg-icons';
import {
    Card, CardHeader, CardRefresh, CardCollapse, CardBadge, CardContent,
} from '@enso-ui/card/bulma';
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import { layout } from '@enso-ui/ui/src/pinia/layout';
import Addresses from './Addresses.vue';

export default {
    name: 'AddressesCard',

    components: {
        Fa,
        Card,
        CardHeader,
        CardRefresh,
        CardCollapse,
        CardBadge,
        CardContent,
        Addresses,
    },

    inject: ['i18n'],

    props: {
        icon: {
            type: [String, Array, Object],
            default: () => faSignsPost,
        },
        id: {
            type: [String, Number],
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        collapsed: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: null,
        },
    },

    data: () => ({
        query: '',
        count: 0,
    }),

    computed: {
        displayTitle() {
            return !layout().isMobile
                ? this.title || this.i18n('Addresses')
                : null;
        },
    },

    watch: {
        count() {
            this.$refs.card.resize();
        },
    },
};
</script>
