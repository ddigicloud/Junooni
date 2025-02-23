import { lexicalEditor } from '@payloadcms/richtext-lexical';
import type { CollectionConfig } from 'payload';

export const BlankProducts: CollectionConfig = {
  slug: 'blank-products',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'cost', type: 'number', required: true, min: 0 },
    { name: 'sku', type: 'text', required: true },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        { name: 'x', type: 'number', required: true },
        { name: 'y', type: 'number', required: true },
        { name: 'customizableWidth', type: 'number', required: true },
        { name: 'customizableHeight', type: 'number', required: true },
      ],
    },
    {
      name: 'sizeChart',
      type: 'upload',
      label: 'Size Chart',
      relationTo: 'media',
      required: false,
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'features',
      type: 'richText',
      label: 'Features',
      editor: lexicalEditor(),
      required: false,
    },
    {
      name: 'displayImages',
      type: 'array',
      label: 'Image Slider',
      minRows: 2,
      maxRows: 10,
      labels: {
        singular: 'Display Image',
        plural: 'Display Images',
      },
      fields: [
        { name: 'title', type: 'text' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'mockupImages',
      type: 'array',
      label: 'Mockups Slider',
      minRows: 1,
      maxRows: 10,
      labels: {
        singular: 'Mockup Image',
        plural: 'Mockup Images',
      },
      fields: [
        { name: 'title', type: 'text' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        { name: 'caption', type: 'text' },
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'designX', type: 'number' },
        { name: 'designY', type: 'number' },
        { name: 'rotation', type: 'number' },
        { name: 'skew', type: 'number' },
        { name: 'scale', type: 'number' },
      ],
    },
    {
      name: 'shippingInfo',
      type: 'group',
      fields: [
        { name: 'weight', type: 'number', required: true },
        { name: 'dimensions', type: 'text' },
      ],
    },
    // New field for selecting the technology
    {
      name: 'technology',
      type: 'select',
      label: 'Printing Technology',
      options: [
        { label: 'DTG', value: 'dtg' },
        { label: 'Vinyl', value: 'vinyl' },
        { label: 'DTFx', value: 'dtfx' },
        { label: 'Embroidery', value: 'embroidery' },
      ],
      required: true,
    },
    // Conditional group for front/back customization
    {
      name: 'frontBackCustomization',
      type: 'group',
      label: 'Front/Back Customization',
      admin: {
        condition: (data) => ['dtg', 'vinyl', 'dtfx'].includes(data.technology),
      },
      fields: [
        {
          name: 'frontDesign',
          type: 'upload',
          label: 'Front Design',
          relationTo: 'media',
        },
        {
          name: 'backDesign',
          type: 'upload',
          label: 'Back Design',
          relationTo: 'media',
        },
      ],
    },
    // Conditional group for sleeve customization
    {
      name: 'sleeveCustomization',
      type: 'group',
      label: 'Sleeve Customization',
      admin: {
        condition: (data) => data.technology === 'embroidery',
      },
      fields: [
        {
          name: 'leftSleeveDesign',
          type: 'upload',
          label: 'Left Sleeve Design',
          relationTo: 'media',
        },
        {
          name: 'rightSleeveDesign',
          type: 'upload',
          label: 'Right Sleeve Design',
          relationTo: 'media',
        },
      ],
    },
    // Field for swatches
    {
      name: 'swatches',
      type: 'array',
      label: 'Color Swatches',
      fields: [
        {
          name: 'colorName',
          type: 'text',
          label: 'Color Name',
          required: true,
        },
        {
          name: 'colorValue',
          type: 'text',
          label: 'Color Value (Hex Code)',
          required: true,
        },
      ],
    },
  ],
};
