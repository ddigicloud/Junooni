import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_blank_products_care_instructions_icon" AS ENUM('wash_cold', 'wash_warm', 'hand_wash', 'no_wash', 'dry_low', 'hang_dry', 'no_dry', 'iron_low', 'no_iron', 'no_bleach');
  CREATE TYPE "public"."enum_blank_products_color_options_fabric_interaction_blend_mode" AS ENUM('normal', 'multiply', 'screen', 'overlay', 'soft_light');
  CREATE TYPE "public"."enum_blank_products_seam_positions_seam_types" AS ENUM('side', 'shoulder', 'sleeve', 'hem', 'custom');
  CREATE TYPE "public"."enum_blank_products_seam_positions_seam_effect" AS ENUM('indent', 'raised', 'flat', 'shadow');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_disp_maps_dsrface" AS ENUM('cylindrical', 'conical', 'spherical');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_alp_masks_alfmask" AS ENUM('alpha', 'luminance', 'red_channel');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_light_ovrly_typ" AS ENUM('lighting', 'shadow', 'reflection', 'ambient');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_light_overbld_mde" AS ENUM('overlay', 'multiply', 'screen', 'soft-light', 'hard-light');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_visibility" AS ENUM('full', 'partial', 'edge', 'sleeve', 'shadow', 'reflection');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_config_mask" AS ENUM('gradient', 'sharp', 'soft', 'svg', 'fold', 'seam');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_grdnmsk_grdn" AS ENUM('horizontal', 'vertical', 'radial', 'angle');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_fbrc_bfab" AS ENUM('cotton', 'polyester', 'canvas', 'leather', 'denim');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_design_blend" AS ENUM('normal', 'multiply', 'screen', 'overlay', 'soft_light');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_uv_map_srfc" AS ENUM('planar', 'cylinder', 'frustum', 'sphere', 'mesh');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_uv_map_orn_type" AS ENUM('feature', 'angle', 'pixel');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_uv_map_wrpmd_u" AS ENUM('clamp', 'repeat', 'mirror');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_uv_map_wpmd_v" AS ENUM('clamp', 'repeat', 'mirror');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_area_fbr_eft_fold" AS ENUM('horizontal', 'vertical', 'radial', 'random');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_view_angle" AS ENUM('front', 'back', 'left', 'right', 'three_quarter_front_left', 'three_quarter_front_right', 'top', 'bottom', 'lifestyle', 'detail', 'flat');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_mockup_type" AS ENUM('studio', 'lifestyle', 'model', 'flat_lay');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_render_pf_engine" AS ENUM('auto', 'canvas', 'pixi');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_render_quality" AS ENUM('draft', 'standard', 'high', 'ultra');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_fbrc_prop_mfab" AS ENUM('cotton', 'polyester', 'cotton_blend', 'canvas', 'leather', 'denim', 'fleece', 'jersey');
  CREATE TYPE "public"."enum_blank_products_print_t_mockup_photos_fbrc_prop_texture" AS ENUM('smooth', 'textured', 'rough', 'glossy', 'matte');
  CREATE TYPE "public"."enum_blank_products_print_t_cust_areas_area_type" AS ENUM('primary', 'secondary', 'accent', 'sleeve', 'back', 'pocket');
  CREATE TYPE "public"."enum_blank_products_print_t_technology_name" AS ENUM('dtg', 'dtf', 'screen', 'sublimation', 'embroidery', 'vinyl', 'digital', 'uv', 'laser');
  CREATE TYPE "public"."enum_blank_products_area_synch_rules_sync_type" AS ENUM('copy', 'mirror_h', 'mirror_v', 'scale');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_anl_dtc_obs" AS ENUM('camera_hole', 'speaker_hole', 'seam', 'port', 'button', 'fold', 'shadow', 'unknown');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_src" AS ENUM('ai_detected', 'template', 'manual', 'hybrid');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_ap_stt" AS ENUM('pending_review', 'approved', 'rejected', 'needs_adjustment');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_vsblty" AS ENUM('full', 'partial', 'edge', 'sleeve', 'shadow', 'reflection', 'device_cutout');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_smrt_srtgy" AS ENUM('ai_automatic', 'template', 'manual', 'hybrid');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_msk_edg" AS ENUM('soft', 'medium', 'sharp', 'ultra');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_gn_msk_msk_typ" AS ENUM('gradient', 'vector', 'bitmap', 'composite');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_view" AS ENUM('front', 'back', 'left', 'right', 'three_quarter_front_left', 'three_quarter_front_right', 'folded', 'lifestyle', 'detail', 'top');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_mock" AS ENUM('studio', 'lifestyle', 'model', 'flat_lay', 'folded', 'detail');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_anl_sts" AS ENUM('pending', 'processing', 'completed', 'failed', 'needs_review');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_smt_cstmtn_ar_area_type" AS ENUM('primary', 'secondary', 'accent', 'sleeve', 'back', 'pocket', 'device_specific');
  CREATE TYPE "public"."enum_blank_products_prnt_tch_technology_name" AS ENUM('dtg', 'dtf', 'screen', 'sublimation', 'embroidery', 'vinyl', 'digital', 'uv', 'laser');
  CREATE TYPE "public"."enum_blank_products_status" AS ENUM('active', 'draft', 'discontinued', 'out_of_stock', 'coming_soon');
  CREATE TYPE "public"."enum_blank_products_product_type" AS ENUM('apparel_tshirt', 'apparel_hoodie', 'apparel_sweatshirt', 'apparel_tank', 'apparel_longsleeve', 'apparel_hat', 'apparel_beanie', 'drinkware_mug', 'drinkware_bottle', 'drinkware_tumbler', 'print_poster', 'print_canvas', 'print_business_card', 'print_sticker', 'accessories_phone_case', 'accessories_tote_bag', 'accessories_backpack', 'home_pillow', 'home_blanket', 'home_towel', 'other');
  CREATE TYPE "public"."enum_blank_products_vendor_info_supplier" AS ENUM('printful', 'printify', 'gooten', 'qikink', 'local', 'direct', 'other');
  CREATE TYPE "public"."enum_blank_products_pricing_markup_type" AS ENUM('percentage', 'fixed', 'tiered');
  CREATE TYPE "public"."enum_blank_products_materials_efab_type" AS ENUM('cotton', 'polyester', 'blend', 'canvas', 'leather', 'denim', 'fleece', 'jersey', 'mesh', 'vinyl', 'paper', 'ceramic', 'metal', 'plastic');
  CREATE TYPE "public"."enum_blank_products_materials_surface_texture" AS ENUM('smooth', 'textured', 'rough', 'glossy', 'matte', 'satin', 'brushed');
  CREATE TYPE "public"."enum_blank_products_physical_dimensions_units" AS ENUM('inches', 'cm', 'mm');
  CREATE TYPE "public"."enum_blank_products_shipping_info_package_type" AS ENUM('poly_mailer', 'box', 'envelope', 'tube', 'custom');
  CREATE TYPE "public"."enum_blank_products_surf_conf_render_type" AS ENUM('flat', 'cylindrical', 'conical', 'spherical', 'complex_3d', 'apparel_body', 'sleeve_wrap');
  CREATE TYPE "public"."enum_blank_products_surf_conf_blend_set_default_blend_mode" AS ENUM('normal', 'multiply', 'screen', 'overlay', 'soft_light');
  CREATE TYPE "public"."enum_blank_products_advan_surf_map_curv_prof" AS ENUM('linear', 'smooth', 'elastic', 'ease_in', 'ease_out', 'custom');
  CREATE TYPE "public"."enum_blank_products_prod_int_prod_temp" AS ENUM('auto_detect', 'apparel_tshirt_standard', 'apparel_tshirt_folded', 'apparel_hoodie_front', 'apparel_hoodie_lifestyle', 'phone_iphone15pro', 'phone_iphone14', 'phone_samsung_s24', 'phone_pixel', 'mug_standard', 'tumbler_travel', 'pillow_square', 'canvas_standard', 'bag_tote', 'custom');
  CREATE TYPE "public"."enum_blank_products_prod_int_auto_det_sett_an_acc" AS ENUM('fast', 'balanced', 'precise', 'ultra');
  CREATE TYPE "public"."enum_blank_products_prod_int_srt_def_o_msk_rls_edge_detct_mode" AS ENUM('automatic', 'geometric', 'color', 'contrast', 'ml');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_header_nav_items_children_sub_children_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_nav_items_children_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_pages_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_pages_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__pages_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__pages_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"hero_image_id" integer,
  	"featured_category" boolean DEFAULT false,
  	"studio_category" boolean DEFAULT true,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blank_products_id" integer
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "blank_products_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE "blank_products_pricing_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_quantity" numeric,
  	"max_quantity" numeric,
  	"markup_percentage" numeric
  );
  
  CREATE TABLE "blank_products_care_instructions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"instruction" varchar NOT NULL,
  	"icon" "enum_blank_products_care_instructions_icon" DEFAULT 'wash_cold'
  );
  
  CREATE TABLE "blank_products_color_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color_name" varchar NOT NULL,
  	"color_hex" varchar NOT NULL,
  	"color_sku" varchar,
  	"is_primary" boolean,
  	"fabric_interaction_absorption_rate" numeric DEFAULT 0.1,
  	"fabric_interaction_blend_mode" "enum_blank_products_color_options_fabric_interaction_blend_mode" DEFAULT 'multiply',
  	"fabric_interaction_color_shift_hue_shift" numeric DEFAULT 0,
  	"fabric_interaction_color_shift_saturation_shift" numeric DEFAULT 0,
  	"fabric_interaction_color_shift_lightness_shift" numeric DEFAULT 0
  );
  
  CREATE TABLE "blank_products_size_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size_name" varchar NOT NULL,
  	"size_sku" varchar,
  	"extra_cost" varchar,
  	"size_description" varchar,
  	"dimensions_width" numeric,
  	"dimensions_height" numeric
  );
  
  CREATE TABLE "blank_products_seam_positions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"seam_types" "enum_blank_products_seam_positions_seam_types" DEFAULT 'side',
  	"position_x" numeric,
  	"position_y" numeric,
  	"width" numeric,
  	"seam_effect" "enum_blank_products_seam_positions_seam_effect" DEFAULT 'indent'
  );
  
  CREATE TABLE "blank_products_print_t_mockup_photos_disp_maps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"disp_img_id" integer NOT NULL,
  	"dsrface" "enum_blank_products_print_t_mockup_photos_disp_maps_dsrface" DEFAULT 'cylindrical',
  	"disint" numeric DEFAULT 0.8,
  	"disarea" varchar NOT NULL
  );
  
  CREATE TABLE "blank_products_print_t_mockup_photos_alp_masks" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mask_img_id" integer NOT NULL,
  	"alfarea" varchar NOT NULL,
  	"alfmask" "enum_blank_products_print_t_mockup_photos_alp_masks_alfmask" DEFAULT 'alpha',
  	"feather_edge" numeric DEFAULT 1
  );
  
  CREATE TABLE "blank_products_print_t_mockup_photos_light" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"over_image_id" integer NOT NULL,
  	"ovrly_typ" "enum_blank_products_print_t_mockup_photos_light_ovrly_typ" DEFAULT 'lighting',
  	"overbld_mde" "enum_blank_products_print_t_mockup_photos_light_overbld_mde" DEFAULT 'overlay',
  	"ovlay_opa" numeric DEFAULT 0.6,
  	"overlay_area" varchar
  );
  
  CREATE TABLE "blank_products_print_t_mockup_photos_area" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area_name" varchar NOT NULL,
  	"visibility" "enum_blank_products_print_t_mockup_photos_area_visibility" DEFAULT 'full',
  	"visibility_percentage" numeric DEFAULT 100,
  	"config_enable_masking" boolean DEFAULT false,
  	"config_mask" "enum_blank_products_print_t_mockup_photos_area_config_mask" DEFAULT 'gradient',
  	"config_mask_path" varchar,
  	"grdnmsk_grdn" "enum_blank_products_print_t_mockup_photos_area_grdnmsk_grdn" DEFAULT 'horizontal',
  	"grdnmsk_gradient_angle" numeric DEFAULT 0,
  	"grdnmsk_fade_start" numeric DEFAULT 0.7,
  	"grdnmsk_fade_end" numeric DEFAULT 1,
  	"grdnmsk_fade_intensity" numeric DEFAULT 0.8,
  	"edge_detection_settings_enable_edge_detection" boolean DEFAULT false,
  	"edge_detection_settings_edge_threshold" numeric DEFAULT 128,
  	"edge_detection_settings_edge_softness" numeric DEFAULT 2,
  	"fbrc_enable_fabric_blend" boolean DEFAULT true,
  	"fbrc_bfab" "enum_blank_products_print_t_mockup_photos_area_fbrc_bfab" DEFAULT 'cotton',
  	"fbrc_fold_awareness" boolean DEFAULT true,
  	"fbrc_seam_awareness" boolean DEFAULT true,
  	"fbrc_texture_intensity" numeric DEFAULT 0.3,
  	"fbrc_fabric_color" varchar DEFAULT '#ffffff',
  	"fbrc_fabric_roughness" numeric DEFAULT 0.3,
  	"design_coordinate_x" numeric NOT NULL,
  	"design_coordinate_y" numeric NOT NULL,
  	"design_coordinate_width" numeric NOT NULL,
  	"design_coordinate_height" numeric NOT NULL,
  	"design_rotation" numeric DEFAULT 0,
  	"design_skew_x" numeric DEFAULT 0,
  	"design_skew_y" numeric DEFAULT 0,
  	"design_scale_x" numeric DEFAULT 1,
  	"design_scale_y" numeric DEFAULT 1,
  	"design_blend" "enum_blank_products_print_t_mockup_photos_area_design_blend" DEFAULT 'normal',
  	"design_opacity" numeric,
  	"design_preserve_colors" boolean,
  	"uv_map_srfc" "enum_blank_products_print_t_mockup_photos_area_uv_map_srfc",
  	"uv_map_u_start" numeric DEFAULT 0,
  	"uv_map_v_start" numeric DEFAULT 0,
  	"uv_map_u_span" numeric DEFAULT 1,
  	"uv_map_v_span" numeric DEFAULT 1,
  	"uv_map_u_repeat" numeric,
  	"uv_map_v_repeat" numeric,
  	"uv_map_rotation_deg" numeric,
  	"uv_map_orn_type" "enum_blank_products_print_t_mockup_photos_area_uv_map_orn_type",
  	"uv_map_orn_feature_name" varchar,
  	"uv_map_orn_angle_deg" numeric,
  	"uv_map_orn_pixel_x" numeric,
  	"uv_map_wrpmd_u" "enum_blank_products_print_t_mockup_photos_area_uv_map_wrpmd_u",
  	"uv_map_wpmd_v" "enum_blank_products_print_t_mockup_photos_area_uv_map_wpmd_v",
  	"surface_wrap_settings_enable_wrap" boolean,
  	"surface_wrap_settings_wrap_angle" numeric DEFAULT 280,
  	"surface_wrap_settings_wrap_intensity" numeric DEFAULT 0.8,
  	"surface_wrap_settings_dynamic_wrap" boolean DEFAULT false,
  	"surface_wrap_settings_wrap_falloff" numeric DEFAULT 0.8,
  	"perspective_settings_enable_perspective" boolean DEFAULT false,
  	"perspective_settings_perspective_intensity" numeric DEFAULT 0.5,
  	"perspective_settings_dynamic_perspective" boolean DEFAULT false,
  	"fbr_eft_enable_folds" boolean DEFAULT false,
  	"fbr_eft_fold_intensity" numeric DEFAULT 0.3,
  	"fbr_eft_fold" "enum_blank_products_print_t_mockup_photos_area_fbr_eft_fold" DEFAULT 'horizontal',
  	"fbr_eft_seam_distrt" boolean DEFAULT false,
  	"fbr_eft_fabric_dpth" numeric DEFAULT 1
  );
  
  CREATE TABLE "blank_products_print_t_mockup_photos_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "blank_products_print_t_mockup_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"photo_id" integer NOT NULL,
  	"mocwidthpx" numeric,
  	"mochigtpx" numeric,
  	"tmbwidthpx" numeric,
  	"tmbhigtpx" numeric,
  	"view_angle" "enum_blank_products_print_t_mockup_photos_view_angle" DEFAULT 'front',
  	"mockup_type" "enum_blank_products_print_t_mockup_photos_mockup_type" DEFAULT 'studio',
  	"photo_color" varchar NOT NULL,
  	"photo_size" varchar,
  	"render_pf_engine" "enum_blank_products_print_t_mockup_photos_render_pf_engine" DEFAULT 'auto',
  	"render_enable_advanced_effects" boolean DEFAULT true,
  	"render_quality" "enum_blank_products_print_t_mockup_photos_render_quality" DEFAULT 'high',
  	"render_export_res" numeric DEFAULT 2,
  	"render_enable_prog_track" boolean DEFAULT true,
  	"fbrc_prop_mfab" "enum_blank_products_print_t_mockup_photos_fbrc_prop_mfab" DEFAULT 'cotton',
  	"fbrc_prop_fabric_weight" numeric DEFAULT 180,
  	"fbrc_prop_texture" "enum_blank_products_print_t_mockup_photos_fbrc_prop_texture" DEFAULT 'textured',
  	"fbrc_prop_stretchability" numeric DEFAULT 0.3,
  	"fbrc_prop_transparency" numeric DEFAULT 0.05,
  	"lighting_conditions_light_direction" numeric DEFAULT 45,
  	"lighting_conditions_light_intensity" numeric DEFAULT 0.8,
  	"lighting_conditions_ambient_light" numeric DEFAULT 0.3,
  	"lighting_conditions_shadow_intensity" numeric DEFAULT 0.4,
  	"priority" numeric DEFAULT 0
  );
  
  CREATE TABLE "blank_products_print_t_cust_areas_design_canvas_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL,
  	"photo_color" varchar,
  	"print_area_coord_x" numeric,
  	"print_area_coord_y" numeric,
  	"print_area_coord_width" numeric,
  	"print_area_coord_height" numeric
  );
  
  CREATE TABLE "blank_products_print_t_cust_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area_id" varchar,
  	"area_name" varchar NOT NULL,
  	"area_type" "enum_blank_products_print_t_cust_areas_area_type" DEFAULT 'primary',
  	"minimum_printing_price" varchar,
  	"per_sq_inch_printing_price" varchar,
  	"canvas_dim_width_inch" numeric NOT NULL,
  	"canvas_dim_height_inch" numeric NOT NULL,
  	"canvas_dim_canvas_pix_wid" numeric DEFAULT 800,
  	"canvas_dim_canvas_pix_height" numeric DEFAULT 600,
  	"canvas_dim_aspect_ratio_locked" boolean DEFAULT true,
  	"restrictions_min_element_size_width" numeric,
  	"restrictions_min_element_size_height" numeric,
  	"restrictions_max_elements" numeric
  );
  
  CREATE TABLE "blank_products_print_t" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"technology_name" "enum_blank_products_print_t_technology_name" DEFAULT 'dtg' NOT NULL,
  	"printing_constraints_dpi_requirements_minimum" numeric DEFAULT 150,
  	"printing_constraints_dpi_requirements_recommended" numeric DEFAULT 300,
  	"printing_constraints_dpi_requirements_maximum" numeric DEFAULT 600,
  	"printing_constraints_size_limits_min_width_inch" numeric DEFAULT 1,
  	"printing_constraints_size_limits_min_height_inch" numeric DEFAULT 1,
  	"printing_constraints_size_limits_max_width_inch" numeric,
  	"printing_constraints_size_limits_max_height_inch" numeric,
  	"printing_constraints_color_limits_max_colors" numeric,
  	"printing_constraints_color_limits_supports_full_color" boolean DEFAULT true,
  	"printing_constraints_print_bleeds_bleed_margin" numeric DEFAULT 3,
  	"printing_constraints_print_bleeds_safety_margin" numeric DEFAULT 5,
  	"printing_constraints_print_bleeds_trim_tolerance" numeric DEFAULT 1
  );
  
  CREATE TABLE "blank_products_area_synch_rules_target_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area" varchar
  );
  
  CREATE TABLE "blank_products_area_synch_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rule_name" varchar NOT NULL,
  	"source_area" varchar NOT NULL,
  	"sync_type" "enum_blank_products_area_synch_rules_sync_type"
  );
  
  CREATE TABLE "blank_products_display_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"title" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "blank_products_prnt_tch_smt_mckp_pht_anl_det_ar" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ar_nme" varchar,
  	"bod_bx_x" numeric,
  	"bod_bx_y" numeric,
  	"bod_bx_width" numeric,
  	"bod_bx_height" numeric,
  	"confdnce" numeric,
  	"sugges_mask" varchar
  );
  
  CREATE TABLE "blank_products_prnt_tch_smt_mckp_pht_anl_dtc" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"obs" "enum_blank_products_prnt_tch_smt_mckp_pht_anl_dtc_obs",
  	"boundbox_x" numeric,
  	"boundbox_y" numeric,
  	"boundbox_width" numeric,
  	"boundbox_height" numeric,
  	"confidence" numeric
  );
  
  CREATE TABLE "blank_products_prnt_tch_smt_mckp_pht_vsa" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area_name" varchar NOT NULL,
  	"src" "enum_blank_products_prnt_tch_smt_mckp_pht_vsa_src" DEFAULT 'ai_detected',
  	"ap_stt" "enum_blank_products_prnt_tch_smt_mckp_pht_vsa_ap_stt" DEFAULT 'pending_review',
  	"vsblty" "enum_blank_products_prnt_tch_smt_mckp_pht_vsa_vsblty" DEFAULT 'full',
  	"visibility_percentage" numeric DEFAULT 100,
  	"smrt_enable_smart_mask" boolean DEFAULT true,
  	"smrt_srtgy" "enum_blank_products_prnt_tch_smt_mckp_pht_vsa_smrt_srtgy" DEFAULT 'ai_automatic',
  	"msk_edg" "enum_blank_products_prnt_tch_smt_mckp_pht_vsa_msk_edg" DEFAULT 'medium',
  	"msk_adapt_to_lighting" boolean DEFAULT true,
  	"msk_fabric_awareness" boolean DEFAULT true,
  	"msk_seam_detection" boolean DEFAULT true,
  	"gn_msk_mask_path" varchar,
  	"gn_msk_msk_typ" "enum_blank_products_prnt_tch_smt_mckp_pht_vsa_gn_msk_msk_typ",
  	"gn_msk_mask_confidence" numeric,
  	"smart_placement_auto_x" numeric,
  	"smart_placement_auto_y" numeric,
  	"smart_placement_auto_width" numeric,
  	"smart_placement_auto_height" numeric,
  	"smart_placement_enable_manual_override" boolean DEFAULT false,
  	"smart_placement_manual_x" numeric,
  	"smart_placement_manual_y" numeric,
  	"smart_placement_manual_width" numeric,
  	"smart_placement_manual_height" numeric,
  	"smart_placement_rotation" numeric DEFAULT 0,
  	"smart_placement_skew_x" numeric DEFAULT 0,
  	"smart_placement_skew_y" numeric DEFAULT 0,
  	"smart_placement_scale_x" numeric DEFAULT 1,
  	"smart_placement_scale_y" numeric DEFAULT 1
  );
  
  CREATE TABLE "blank_products_prnt_tch_smt_mckp_pht_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "blank_products_prnt_tch_smt_mckp_pht" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"photo_id" integer NOT NULL,
  	"view" "enum_blank_products_prnt_tch_smt_mckp_pht_view" DEFAULT 'front',
  	"mock" "enum_blank_products_prnt_tch_smt_mckp_pht_mock" DEFAULT 'studio',
  	"photo_color" varchar NOT NULL,
  	"anl_sts" "enum_blank_products_prnt_tch_smt_mckp_pht_anl_sts" DEFAULT 'pending',
  	"anl_det_prod_ty" varchar,
  	"anl_conf_score" numeric,
  	"priority" numeric DEFAULT 0
  );
  
  CREATE TABLE "blank_products_prnt_tch_smt_cstmtn_ar" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area_id" varchar,
  	"area_name" varchar NOT NULL,
  	"area_type" "enum_blank_products_prnt_tch_smt_cstmtn_ar_area_type" DEFAULT 'primary',
  	"smart_canvas_config_use_a_i_calculated_dimensions" boolean DEFAULT true,
  	"smart_canvas_config_ai_width_inches" numeric,
  	"smart_canvas_config_ai_height_inches" numeric,
  	"smart_canvas_config_ai_canvas_pixel_width" numeric,
  	"smart_canvas_config_ai_canvas_pixel_height" numeric,
  	"smart_canvas_config_manual_width_inches" numeric,
  	"smart_canvas_config_manual_height_inches" numeric,
  	"smart_canvas_config_manual_canvas_pixel_width" numeric DEFAULT 800,
  	"smart_canvas_config_manual_canvas_pixel_height" numeric DEFAULT 600,
  	"smart_canvas_config_aspect_ratio_locked" boolean DEFAULT true
  );
  
  CREATE TABLE "blank_products_prnt_tch" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"technology_name" "enum_blank_products_prnt_tch_technology_name" DEFAULT 'dtg' NOT NULL
  );
  
  CREATE TABLE "blank_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_blank_products_status" DEFAULT 'draft' NOT NULL,
  	"product_type" "enum_blank_products_product_type" DEFAULT 'apparel_tshirt' NOT NULL,
  	"brand" varchar NOT NULL,
  	"brand_sku" varchar,
  	"sku" varchar NOT NULL,
  	"manufacturer_sku" varchar,
  	"vendor_info_supplier" "enum_blank_products_vendor_info_supplier",
  	"vendor_info_supplier_product_id" varchar,
  	"vendor_info_country_origin" varchar,
  	"sourcing_min_order_qty" numeric,
  	"sourcing_lead_time_days" varchar,
  	"sourcing_ship_time_days" varchar,
  	"sourcing_rush_available" boolean,
  	"sourcing_rush_lead_time_days" numeric,
  	"cost" numeric NOT NULL,
  	"gst_cost" numeric,
  	"pricing_markup_type" "enum_blank_products_pricing_markup_type",
  	"pricing_markup_value" numeric,
  	"pricing_suggested_retail" numeric,
  	"additional_costs_printing_cost_per_area" numeric,
  	"additional_costs_printing_g_s_t" numeric,
  	"additional_costs_setup_fee" numeric,
  	"additional_costs_rush_surcharge" numeric,
  	"description" varchar,
  	"features" jsonb,
  	"h_s_n_code" varchar,
  	"materials_primary" varchar,
  	"materials_weight" varchar,
  	"materials_construction" varchar,
  	"materials_finish" varchar,
  	"materials_efab_type" "enum_blank_products_materials_efab_type" DEFAULT 'cotton',
  	"materials_fabric_weight" numeric DEFAULT 180,
  	"materials_surface_texture" "enum_blank_products_materials_surface_texture" DEFAULT 'smooth',
  	"materials_stretchability" numeric DEFAULT 0.1,
  	"materials_transparency" numeric DEFAULT 0.05,
  	"materials_reflectivity" numeric DEFAULT 0.1,
  	"physical_dimensions_width_inches" numeric,
  	"physical_dimensions_height_inches" numeric,
  	"physical_dimensions_depth_inches" numeric,
  	"physical_dimensions_diameter" numeric,
  	"physical_dimensions_units" "enum_blank_products_physical_dimensions_units" DEFAULT 'inches',
  	"shipping_info_weight" numeric NOT NULL,
  	"shipping_info_shipping_dimensions" varchar,
  	"shipping_info_shipping_charges" varchar,
  	"shipping_info_shipping_location_i_d" varchar,
  	"shipping_info_shipping_profile_i_d" varchar,
  	"shipping_info_package_type" "enum_blank_products_shipping_info_package_type" DEFAULT 'poly_mailer',
  	"color_images" boolean DEFAULT true,
  	"size_images" boolean DEFAULT false,
  	"size_chart_id" integer,
  	"size_chart_html" varchar,
  	"surf_conf_no_mockup_compatible" boolean DEFAULT false,
  	"surf_conf_render_type" "enum_blank_products_surf_conf_render_type" DEFAULT 'flat' NOT NULL,
  	"surf_conf_surf_prop_wrap_angle" numeric DEFAULT 280,
  	"surf_conf_surf_prop_curve_inten" numeric DEFAULT 0.8,
  	"surf_conf_surf_prop_design_ratio_width_ratio" numeric,
  	"surf_conf_surf_prop_design_ratio_height_ratio" numeric,
  	"surf_conf_blend_set_default_blend_mode" "enum_blank_products_surf_conf_blend_set_default_blend_mode" DEFAULT 'normal',
  	"surf_conf_blend_set_default_opacity" numeric,
  	"surf_conf_blend_set_preserve_colors" boolean DEFAULT true,
  	"advan_surf_map_curv_prof" "enum_blank_products_advan_surf_map_curv_prof" DEFAULT 'smooth',
  	"advan_surf_map_barrel_dist" numeric DEFAULT 0,
  	"advan_surf_map_pincushi_distor" numeric DEFAULT 0,
  	"advan_surf_map_persp_dis" numeric DEFAULT 1,
  	"advan_surf_map_has_seams" boolean DEFAULT false,
  	"lighting_configuration_light_direction" numeric DEFAULT 45,
  	"lighting_configuration_light_intensity" numeric DEFAULT 0.8,
  	"lighting_configuration_ambient_light" numeric DEFAULT 0.3,
  	"lighting_configuration_shadow_intensity" numeric DEFAULT 0.4,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"prod_int_prod_temp" "enum_blank_products_prod_int_prod_temp" DEFAULT 'auto_detect' NOT NULL,
  	"prod_int_auto_det_sett_en_img_anal" boolean DEFAULT true,
  	"prod_int_auto_det_sett_an_acc" "enum_blank_products_prod_int_auto_det_sett_an_acc" DEFAULT 'balanced',
  	"prod_int_auto_det_sett_det_thres" numeric DEFAULT 0.7,
  	"prod_int_auto_det_sett_manl_req" boolean DEFAULT true,
  	"prod_int_srt_def_intfrm_tlt" boolean DEFAULT true,
  	"prod_int_srt_def_o_msk_rls_enables_mask" boolean DEFAULT true,
  	"prod_int_srt_def_o_msk_rls_edge_detct_mode" "enum_blank_products_prod_int_srt_def_o_msk_rls_edge_detct_mode" DEFAULT 'automatic',
  	"prod_int_srt_def_o_msk_rls_occl_detct_detect_cam_hole" boolean DEFAULT true,
  	"prod_int_srt_def_o_msk_rls_occl_detct_detect_seams" boolean DEFAULT true,
  	"prod_int_srt_def_o_msk_rls_occl_detct_detect_folds" boolean DEFAULT true,
  	"prod_int_srt_def_o_msk_rls_occl_detct_detect_shadows" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blank_products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar,
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"submit_button_label" varchar,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"confirmation_message" jsonb,
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"users_id" integer,
  	"blank_products_id" integer,
  	"redirects_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"search_id" integer,
  	"payload_jobs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items_children_sub_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_children_sub_children_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header_nav_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_children_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_archive" ADD CONSTRAINT "pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_archive" ADD CONSTRAINT "_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_blank_products_fk" FOREIGN KEY ("blank_products_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_tags" ADD CONSTRAINT "blank_products_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_pricing_tiers" ADD CONSTRAINT "blank_products_pricing_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_care_instructions" ADD CONSTRAINT "blank_products_care_instructions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_color_options" ADD CONSTRAINT "blank_products_color_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_size_options" ADD CONSTRAINT "blank_products_size_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_seam_positions" ADD CONSTRAINT "blank_products_seam_positions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos_disp_maps" ADD CONSTRAINT "blank_products_print_t_mockup_photos_disp_maps_disp_img_id_media_id_fk" FOREIGN KEY ("disp_img_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos_disp_maps" ADD CONSTRAINT "blank_products_print_t_mockup_photos_disp_maps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_print_t_mockup_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos_alp_masks" ADD CONSTRAINT "blank_products_print_t_mockup_photos_alp_masks_mask_img_id_media_id_fk" FOREIGN KEY ("mask_img_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos_alp_masks" ADD CONSTRAINT "blank_products_print_t_mockup_photos_alp_masks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_print_t_mockup_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos_light" ADD CONSTRAINT "blank_products_print_t_mockup_photos_light_over_image_id_media_id_fk" FOREIGN KEY ("over_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos_light" ADD CONSTRAINT "blank_products_print_t_mockup_photos_light_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_print_t_mockup_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos_area" ADD CONSTRAINT "blank_products_print_t_mockup_photos_area_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_print_t_mockup_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos_tags" ADD CONSTRAINT "blank_products_print_t_mockup_photos_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_print_t_mockup_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos" ADD CONSTRAINT "blank_products_print_t_mockup_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_mockup_photos" ADD CONSTRAINT "blank_products_print_t_mockup_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_print_t"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_cust_areas_design_canvas_photos" ADD CONSTRAINT "blank_products_print_t_cust_areas_design_canvas_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_cust_areas_design_canvas_photos" ADD CONSTRAINT "blank_products_print_t_cust_areas_design_canvas_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_print_t_cust_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t_cust_areas" ADD CONSTRAINT "blank_products_print_t_cust_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_print_t"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_print_t" ADD CONSTRAINT "blank_products_print_t_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_area_synch_rules_target_areas" ADD CONSTRAINT "blank_products_area_synch_rules_target_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_area_synch_rules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_area_synch_rules" ADD CONSTRAINT "blank_products_area_synch_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_display_images" ADD CONSTRAINT "blank_products_display_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blank_products_display_images" ADD CONSTRAINT "blank_products_display_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_prnt_tch_smt_mckp_pht_anl_det_ar" ADD CONSTRAINT "blank_products_prnt_tch_smt_mckp_pht_anl_det_ar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_prnt_tch_smt_mckp_pht"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_prnt_tch_smt_mckp_pht_anl_dtc" ADD CONSTRAINT "blank_products_prnt_tch_smt_mckp_pht_anl_dtc_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_prnt_tch_smt_mckp_pht"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_prnt_tch_smt_mckp_pht_vsa" ADD CONSTRAINT "blank_products_prnt_tch_smt_mckp_pht_vsa_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_prnt_tch_smt_mckp_pht"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_prnt_tch_smt_mckp_pht_tags" ADD CONSTRAINT "blank_products_prnt_tch_smt_mckp_pht_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_prnt_tch_smt_mckp_pht"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_prnt_tch_smt_mckp_pht" ADD CONSTRAINT "blank_products_prnt_tch_smt_mckp_pht_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blank_products_prnt_tch_smt_mckp_pht" ADD CONSTRAINT "blank_products_prnt_tch_smt_mckp_pht_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_prnt_tch"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_prnt_tch_smt_cstmtn_ar" ADD CONSTRAINT "blank_products_prnt_tch_smt_cstmtn_ar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products_prnt_tch"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_prnt_tch" ADD CONSTRAINT "blank_products_prnt_tch_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products" ADD CONSTRAINT "blank_products_size_chart_id_media_id_fk" FOREIGN KEY ("size_chart_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blank_products_rels" ADD CONSTRAINT "blank_products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blank_products_rels" ADD CONSTRAINT "blank_products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blank_products_fk" FOREIGN KEY ("blank_products_id") REFERENCES "public"."blank_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk" FOREIGN KEY ("payload_jobs_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_children_sub_children" ADD CONSTRAINT "header_nav_items_children_sub_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_children" ADD CONSTRAINT "header_nav_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_archive_order_idx" ON "pages_blocks_archive" USING btree ("_order");
  CREATE INDEX "pages_blocks_archive_parent_id_idx" ON "pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_archive_path_idx" ON "pages_blocks_archive" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_archive_order_idx" ON "_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_archive_parent_id_idx" ON "_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_archive_path_idx" ON "_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories_hero_image_idx" ON "categories" USING btree ("hero_image_id");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
  CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
  CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
  CREATE INDEX "categories_rels_blank_products_id_idx" ON "categories_rels" USING btree ("blank_products_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "blank_products_tags_order_idx" ON "blank_products_tags" USING btree ("_order");
  CREATE INDEX "blank_products_tags_parent_id_idx" ON "blank_products_tags" USING btree ("_parent_id");
  CREATE INDEX "blank_products_pricing_tiers_order_idx" ON "blank_products_pricing_tiers" USING btree ("_order");
  CREATE INDEX "blank_products_pricing_tiers_parent_id_idx" ON "blank_products_pricing_tiers" USING btree ("_parent_id");
  CREATE INDEX "blank_products_care_instructions_order_idx" ON "blank_products_care_instructions" USING btree ("_order");
  CREATE INDEX "blank_products_care_instructions_parent_id_idx" ON "blank_products_care_instructions" USING btree ("_parent_id");
  CREATE INDEX "blank_products_color_options_order_idx" ON "blank_products_color_options" USING btree ("_order");
  CREATE INDEX "blank_products_color_options_parent_id_idx" ON "blank_products_color_options" USING btree ("_parent_id");
  CREATE INDEX "blank_products_size_options_order_idx" ON "blank_products_size_options" USING btree ("_order");
  CREATE INDEX "blank_products_size_options_parent_id_idx" ON "blank_products_size_options" USING btree ("_parent_id");
  CREATE INDEX "blank_products_seam_positions_order_idx" ON "blank_products_seam_positions" USING btree ("_order");
  CREATE INDEX "blank_products_seam_positions_parent_id_idx" ON "blank_products_seam_positions" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_disp_maps_order_idx" ON "blank_products_print_t_mockup_photos_disp_maps" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_mockup_photos_disp_maps_parent_id_idx" ON "blank_products_print_t_mockup_photos_disp_maps" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_disp_maps_disp_img_idx" ON "blank_products_print_t_mockup_photos_disp_maps" USING btree ("disp_img_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_alp_masks_order_idx" ON "blank_products_print_t_mockup_photos_alp_masks" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_mockup_photos_alp_masks_parent_id_idx" ON "blank_products_print_t_mockup_photos_alp_masks" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_alp_masks_mask_img_idx" ON "blank_products_print_t_mockup_photos_alp_masks" USING btree ("mask_img_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_light_order_idx" ON "blank_products_print_t_mockup_photos_light" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_mockup_photos_light_parent_id_idx" ON "blank_products_print_t_mockup_photos_light" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_light_over_image_idx" ON "blank_products_print_t_mockup_photos_light" USING btree ("over_image_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_area_order_idx" ON "blank_products_print_t_mockup_photos_area" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_mockup_photos_area_parent_id_idx" ON "blank_products_print_t_mockup_photos_area" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_tags_order_idx" ON "blank_products_print_t_mockup_photos_tags" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_mockup_photos_tags_parent_id_idx" ON "blank_products_print_t_mockup_photos_tags" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_order_idx" ON "blank_products_print_t_mockup_photos" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_mockup_photos_parent_id_idx" ON "blank_products_print_t_mockup_photos" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_mockup_photos_photo_idx" ON "blank_products_print_t_mockup_photos" USING btree ("photo_id");
  CREATE INDEX "blank_products_print_t_cust_areas_design_canvas_photos_order_idx" ON "blank_products_print_t_cust_areas_design_canvas_photos" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_cust_areas_design_canvas_photos_parent_id_idx" ON "blank_products_print_t_cust_areas_design_canvas_photos" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_cust_areas_design_canvas_photos_photo_idx" ON "blank_products_print_t_cust_areas_design_canvas_photos" USING btree ("photo_id");
  CREATE INDEX "blank_products_print_t_cust_areas_order_idx" ON "blank_products_print_t_cust_areas" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_cust_areas_parent_id_idx" ON "blank_products_print_t_cust_areas" USING btree ("_parent_id");
  CREATE INDEX "blank_products_print_t_order_idx" ON "blank_products_print_t" USING btree ("_order");
  CREATE INDEX "blank_products_print_t_parent_id_idx" ON "blank_products_print_t" USING btree ("_parent_id");
  CREATE INDEX "blank_products_area_synch_rules_target_areas_order_idx" ON "blank_products_area_synch_rules_target_areas" USING btree ("_order");
  CREATE INDEX "blank_products_area_synch_rules_target_areas_parent_id_idx" ON "blank_products_area_synch_rules_target_areas" USING btree ("_parent_id");
  CREATE INDEX "blank_products_area_synch_rules_order_idx" ON "blank_products_area_synch_rules" USING btree ("_order");
  CREATE INDEX "blank_products_area_synch_rules_parent_id_idx" ON "blank_products_area_synch_rules" USING btree ("_parent_id");
  CREATE INDEX "blank_products_display_images_order_idx" ON "blank_products_display_images" USING btree ("_order");
  CREATE INDEX "blank_products_display_images_parent_id_idx" ON "blank_products_display_images" USING btree ("_parent_id");
  CREATE INDEX "blank_products_display_images_image_idx" ON "blank_products_display_images" USING btree ("image_id");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_anl_det_ar_order_idx" ON "blank_products_prnt_tch_smt_mckp_pht_anl_det_ar" USING btree ("_order");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_anl_det_ar_parent_id_idx" ON "blank_products_prnt_tch_smt_mckp_pht_anl_det_ar" USING btree ("_parent_id");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_anl_dtc_order_idx" ON "blank_products_prnt_tch_smt_mckp_pht_anl_dtc" USING btree ("_order");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_anl_dtc_parent_id_idx" ON "blank_products_prnt_tch_smt_mckp_pht_anl_dtc" USING btree ("_parent_id");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_vsa_order_idx" ON "blank_products_prnt_tch_smt_mckp_pht_vsa" USING btree ("_order");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_vsa_parent_id_idx" ON "blank_products_prnt_tch_smt_mckp_pht_vsa" USING btree ("_parent_id");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_tags_order_idx" ON "blank_products_prnt_tch_smt_mckp_pht_tags" USING btree ("_order");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_tags_parent_id_idx" ON "blank_products_prnt_tch_smt_mckp_pht_tags" USING btree ("_parent_id");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_order_idx" ON "blank_products_prnt_tch_smt_mckp_pht" USING btree ("_order");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_parent_id_idx" ON "blank_products_prnt_tch_smt_mckp_pht" USING btree ("_parent_id");
  CREATE INDEX "blank_products_prnt_tch_smt_mckp_pht_photo_idx" ON "blank_products_prnt_tch_smt_mckp_pht" USING btree ("photo_id");
  CREATE INDEX "blank_products_prnt_tch_smt_cstmtn_ar_order_idx" ON "blank_products_prnt_tch_smt_cstmtn_ar" USING btree ("_order");
  CREATE INDEX "blank_products_prnt_tch_smt_cstmtn_ar_parent_id_idx" ON "blank_products_prnt_tch_smt_cstmtn_ar" USING btree ("_parent_id");
  CREATE INDEX "blank_products_prnt_tch_order_idx" ON "blank_products_prnt_tch" USING btree ("_order");
  CREATE INDEX "blank_products_prnt_tch_parent_id_idx" ON "blank_products_prnt_tch" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "blank_products_slug_idx" ON "blank_products" USING btree ("slug");
  CREATE UNIQUE INDEX "blank_products_sku_idx" ON "blank_products" USING btree ("sku");
  CREATE INDEX "blank_products_size_chart_idx" ON "blank_products" USING btree ("size_chart_id");
  CREATE INDEX "blank_products_updated_at_idx" ON "blank_products" USING btree ("updated_at");
  CREATE INDEX "blank_products_created_at_idx" ON "blank_products" USING btree ("created_at");
  CREATE INDEX "blank_products_rels_order_idx" ON "blank_products_rels" USING btree ("order");
  CREATE INDEX "blank_products_rels_parent_idx" ON "blank_products_rels" USING btree ("parent_id");
  CREATE INDEX "blank_products_rels_path_idx" ON "blank_products_rels" USING btree ("path");
  CREATE INDEX "blank_products_rels_categories_id_idx" ON "blank_products_rels" USING btree ("categories_id");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_blank_products_id_idx" ON "payload_locked_documents_rels" USING btree ("blank_products_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_payload_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_jobs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_children_sub_children_order_idx" ON "header_nav_items_children_sub_children" USING btree ("_order");
  CREATE INDEX "header_nav_items_children_sub_children_parent_id_idx" ON "header_nav_items_children_sub_children" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_children_order_idx" ON "header_nav_items_children" USING btree ("_order");
  CREATE INDEX "header_nav_items_children_parent_id_idx" ON "header_nav_items_children" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "header_rels_categories_id_idx" ON "header_rels" USING btree ("categories_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  CREATE INDEX "footer_rels_categories_id_idx" ON "footer_rels" USING btree ("categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_archive" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_archive" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_rels" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "blank_products_tags" CASCADE;
  DROP TABLE "blank_products_pricing_tiers" CASCADE;
  DROP TABLE "blank_products_care_instructions" CASCADE;
  DROP TABLE "blank_products_color_options" CASCADE;
  DROP TABLE "blank_products_size_options" CASCADE;
  DROP TABLE "blank_products_seam_positions" CASCADE;
  DROP TABLE "blank_products_print_t_mockup_photos_disp_maps" CASCADE;
  DROP TABLE "blank_products_print_t_mockup_photos_alp_masks" CASCADE;
  DROP TABLE "blank_products_print_t_mockup_photos_light" CASCADE;
  DROP TABLE "blank_products_print_t_mockup_photos_area" CASCADE;
  DROP TABLE "blank_products_print_t_mockup_photos_tags" CASCADE;
  DROP TABLE "blank_products_print_t_mockup_photos" CASCADE;
  DROP TABLE "blank_products_print_t_cust_areas_design_canvas_photos" CASCADE;
  DROP TABLE "blank_products_print_t_cust_areas" CASCADE;
  DROP TABLE "blank_products_print_t" CASCADE;
  DROP TABLE "blank_products_area_synch_rules_target_areas" CASCADE;
  DROP TABLE "blank_products_area_synch_rules" CASCADE;
  DROP TABLE "blank_products_display_images" CASCADE;
  DROP TABLE "blank_products_prnt_tch_smt_mckp_pht_anl_det_ar" CASCADE;
  DROP TABLE "blank_products_prnt_tch_smt_mckp_pht_anl_dtc" CASCADE;
  DROP TABLE "blank_products_prnt_tch_smt_mckp_pht_vsa" CASCADE;
  DROP TABLE "blank_products_prnt_tch_smt_mckp_pht_tags" CASCADE;
  DROP TABLE "blank_products_prnt_tch_smt_mckp_pht" CASCADE;
  DROP TABLE "blank_products_prnt_tch_smt_cstmtn_ar" CASCADE;
  DROP TABLE "blank_products_prnt_tch" CASCADE;
  DROP TABLE "blank_products" CASCADE;
  DROP TABLE "blank_products_rels" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items_children_sub_children" CASCADE;
  DROP TABLE "header_nav_items_children" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_archive_populate_by";
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_blank_products_care_instructions_icon";
  DROP TYPE "public"."enum_blank_products_color_options_fabric_interaction_blend_mode";
  DROP TYPE "public"."enum_blank_products_seam_positions_seam_types";
  DROP TYPE "public"."enum_blank_products_seam_positions_seam_effect";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_disp_maps_dsrface";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_alp_masks_alfmask";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_light_ovrly_typ";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_light_overbld_mde";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_visibility";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_config_mask";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_grdnmsk_grdn";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_fbrc_bfab";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_design_blend";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_uv_map_srfc";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_uv_map_orn_type";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_uv_map_wrpmd_u";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_uv_map_wpmd_v";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_area_fbr_eft_fold";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_view_angle";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_mockup_type";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_render_pf_engine";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_render_quality";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_fbrc_prop_mfab";
  DROP TYPE "public"."enum_blank_products_print_t_mockup_photos_fbrc_prop_texture";
  DROP TYPE "public"."enum_blank_products_print_t_cust_areas_area_type";
  DROP TYPE "public"."enum_blank_products_print_t_technology_name";
  DROP TYPE "public"."enum_blank_products_area_synch_rules_sync_type";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_anl_dtc_obs";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_src";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_ap_stt";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_vsblty";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_smrt_srtgy";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_msk_edg";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_vsa_gn_msk_msk_typ";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_view";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_mock";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_mckp_pht_anl_sts";
  DROP TYPE "public"."enum_blank_products_prnt_tch_smt_cstmtn_ar_area_type";
  DROP TYPE "public"."enum_blank_products_prnt_tch_technology_name";
  DROP TYPE "public"."enum_blank_products_status";
  DROP TYPE "public"."enum_blank_products_product_type";
  DROP TYPE "public"."enum_blank_products_vendor_info_supplier";
  DROP TYPE "public"."enum_blank_products_pricing_markup_type";
  DROP TYPE "public"."enum_blank_products_materials_efab_type";
  DROP TYPE "public"."enum_blank_products_materials_surface_texture";
  DROP TYPE "public"."enum_blank_products_physical_dimensions_units";
  DROP TYPE "public"."enum_blank_products_shipping_info_package_type";
  DROP TYPE "public"."enum_blank_products_surf_conf_render_type";
  DROP TYPE "public"."enum_blank_products_surf_conf_blend_set_default_blend_mode";
  DROP TYPE "public"."enum_blank_products_advan_surf_map_curv_prof";
  DROP TYPE "public"."enum_blank_products_prod_int_prod_temp";
  DROP TYPE "public"."enum_blank_products_prod_int_auto_det_sett_an_acc";
  DROP TYPE "public"."enum_blank_products_prod_int_srt_def_o_msk_rls_edge_detct_mode";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_header_nav_items_children_sub_children_link_type";
  DROP TYPE "public"."enum_header_nav_items_children_link_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";`)
}
