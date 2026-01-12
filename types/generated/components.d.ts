import type { Attribute, Schema } from '@strapi/strapi';

export interface SizeSize extends Schema.Component {
  collectionName: 'components_sizes_size';
  info: {
    description: 'Holds the size details for an item';
    name: 'Size';
  };
  attributes: {
    itemsCount: Attribute.Integer & Attribute.DefaultTo<0>;
    name: Attribute.String & Attribute.Required;
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
