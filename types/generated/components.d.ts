import type { Schema, Attribute } from '@strapi/strapi';

export interface SizeSize extends Schema.Component {
  collectionName: 'components_sizes_size';
  info: {
    name: 'Size';
    description: 'Holds the size details for an item';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    itemsCount: Attribute.Integer & Attribute.DefaultTo<0>;
    soldOut: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'size.size': SizeSize;
    }
  }
}
