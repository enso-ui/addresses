import { describe, expect, it, vi } from 'vitest';

vi.mock('@enso-ui/ui/src/pinia/layout', () => ({
    layout: () => ({ isMobile: false }),
}));

vi.mock('@enso-ui/card/bulma', () => ({
    Card: {},
    CardHeader: {},
    CardRefresh: {},
    CardCollapse: {},
    CardBadge: {},
    CardContent: {},
}));

vi.mock('../src/bulma/Addresses.vue', () => ({
    default: {},
}));

import AddressesCard from '../src/bulma/AddressesCard.vue';

describe('AddressesCard', () => {
    it('renders desktop title from context without layout alias helpers', () => {
        const title = AddressesCard.computed.displayTitle.call({
            title: null,
            i18n: value => value,
        });

        expect(title).toBe('Addresses');
    });
});
