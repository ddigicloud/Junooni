import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';
import { Banner } from '../blocks/Banner/config'
import { Code } from '../blocks/Code/config'
import { MediaBlock } from '../blocks/MediaBlock/config'
import type { CollectionConfig } from 'payload';

export const BlankProducts: CollectionConfig = {
  slug: 'blank-products',
  access: {
    read: () => true
  },
  admin: { useAsTitle: 'name' },
  fields: [
    // Basic product details
    { name: 'name', type: 'text', required: true },
    { name: 'cost', type: 'number', required: true, min: 0 },
    { name: 'sku', type: 'text', required: true },
    { name: 'brand', type: 'text', required: true },
    { name: 'Brandsku', type: 'text'},
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
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories', // The slug of the Categories collection
      hasMany: true, // Allows picking multiple categories
      label: 'Select Categories',
      required: false,
    },
    // New field: Color Options
    {
      name: 'colorOptions',
      type: 'array',
      label: 'Color Options',
      minRows: 0,
      labels: {
        singular: 'Color Option',
        plural: 'Color Options',
      },
      fields: [
        {
          name: 'colorName',
          type: 'text',
          label: 'Color Name',
          required: true,
        },
        {
          name: 'colorHex',
          type: 'text',
          label: 'Color Hex Code',
          required: true,
        },
        // Optionally, you can add a custom component for color picking here
        // admin: { component: 'ColorPicker' }
      ],
    },
    // Size Options field (new)
    {
      name: 'sizeOptions',
      type: 'array',
      label: 'Size Options',
      minRows: 0,
      labels: {
        singular: 'Size Option',
        plural: 'Size Options',
      },
      fields: [
        {
          name: 'sizeName',
          type: 'text',
          label: 'Size Name',
          required: true,
        },
        {
          name: 'sizeDescription',
          type: 'textarea',
          label: 'Size Description',
          required: false,
        },
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
       editor: lexicalEditor({
                      features: ({ rootFeatures }) => {
                        return [
                          ...rootFeatures,
                          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                          BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                          FixedToolbarFeature(),
                          InlineToolbarFeature(),
                          HorizontalRuleFeature(),
                        ]
                      },
                    }),
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
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'x', type: 'number' },
        { name: 'y', type: 'number' },
        { name: 'rotation', type: 'number' },
        { name: 'skew', type: 'number' },
        { name: 'scale', type: 'number' },
        // Add color hex option for each mockup photo
        {
          name: 'photoColor',
          type: 'text',
          label: 'Photo Color Hex',
          admin: {
            description: 'Enter a hex code or use a color picker if available',
          },
        },
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
    
    // New field for printing technologies – an array so multiple entries can be added.
    {
      name: 'printingTechnologies',
      type: 'array',
      label: 'Printing Technologies',
      minRows: 0,
      labels: {
        singular: 'Printing Technology',
        plural: 'Printing Technologies',
      },
      fields: [
        // Technology name selection
        {
          name: 'technologyName',
          type: 'select',
          label: 'Technology',
          options: [
            { label: 'DTG', value: 'dtg' },
            { label: 'DTF', value: 'dtf' },
            { label: 'Vinyl', value: 'vinyl' },
            { label: 'Embroidery', value: 'embroidery' },
          ],
          required: true,
        },
        // Array of customization areas for this printing technology
        {
          name: 'customizationAreas',
          type: 'array',
          label: 'Customization Areas',
          minRows: 0,
          labels: {
            singular: 'Customization Area',
            plural: 'Customization Areas',
          },
          fields: [
            // Name of the customization area (e.g., Front, Back, Sleeves)
            {
              name: 'areaName',
              type: 'text',
              label: 'Area Name',
              required: true,
            },
            // For each customization area, an array of photos with design parameters
            {
              name: 'photos',
              type: 'array',
              label: 'Photos',
              minRows: 0,
              labels: {
                singular: 'Photo',
                plural: 'Photos',
              },
              fields: [
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Photo',
                  required: true,
                },
                // New color picker field for each photo
                {
                  name: 'photoColor',
                  type: 'text',
                  label: 'Photo Color Hex',
                  admin: {
                    description: 'Enter a hex code (e.g. #ff0000) or select via a color picker if available',
                  },
                },
                {
                  name: 'customizableWidth',
                  type: 'number',
                  label: 'Customizable Width',
                  required: true,
                },
                {
                  name: 'customizableHeight',
                  type: 'number',
                  label: 'Customizable Height',
                  required: true,
                },
                {
                  name: 'x',
                  type: 'number',
                  label: 'X Position',
                  required: true,
                },
                {
                  name: 'y',
                  type: 'number',
                  label: 'Y Position',
                  required: true,
                },
              ],
            },
          ],
        },
        // Array for mockup photos specific to this printing technology.
        {
          name: 'mockupPhotos',
          type: 'array',
          label: 'Mockup Photos',
          minRows: 0,
          labels: {
            singular: 'Mockup Photo',
            plural: 'Mockup Photos',
          },
          fields: [
            { name: 'title', type: 'text', label: 'Title' },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Photo',
              required: true,
            },
            { name: 'width', type: 'number', label: 'Width' },
            { name: 'height', type: 'number', label: 'Height' },
            { name: 'x', type: 'number', label: 'X Position' },
            { name: 'y', type: 'number', label: 'Y Position' },
            { name: 'rotation', type: 'number', label: 'Rotation' },
            { name: 'skew', type: 'number', label: 'Skew' },
            { name: 'scale', type: 'number', label: 'Scale' },
            // Add color picker for each mockup photo as well
            {
              name: 'photoColor',
              type: 'text',
              label: 'Photo Color Hex',
              admin: {
                description: 'Enter a hex code (e.g. #ff0000) for this mockup photo',
              },
            },
          ],
        },
      ],
    },
  ],
};
