import React, { useState } from 'react';
import ImageField from '../ImageField/ImageField';

function Field({ label, children }) {
  return (
    <label className="block font-nav text-xs text-nabat-muted">
      <span className="mb-1.5 block uppercase tracking-[0.12em]">{label}</span>
      {children}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  multiline = false,
  dir,
  type = 'text',
}) {
  return (
    <Field label={label}>
      {multiline ? (
        <textarea
          className="input-box"
          rows={3}
          dir={dir}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input-box"
          type={type}
          dir={dir}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

function SectionCard({ title, hint, children, onSave, saving, saveLabel }) {
  return (
    <div className="border border-nabat-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-medium">{title}</h3>
          {hint ? (
            <p className="mt-1 font-nav text-xs text-nabat-muted">{hint}</p>
          ) : null}
        </div>
        {onSave ? (
          <button
            type="button"
            className="btn-primary shrink-0 !px-4 !py-2.5"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? 'Saving…' : saveLabel || 'Save this section'}
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-6">{children}</div>
    </div>
  );
}

function CardListEditor({
  items,
  onChange,
  fields,
  imageFolder,
  addLabel,
  newItem,
}) {
  const updateItem = (index, patch) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className="space-y-4 border border-nabat-border bg-nabat-soft/40 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-nav text-xs uppercase tracking-[0.14em] text-nabat-muted">
              Card {index + 1}
              {item.id ? ` · ${item.id}` : ''}
            </p>
            <button
              type="button"
              className="font-nav text-xs text-red-600 hover:underline"
              onClick={() => removeItem(index)}
            >
              Remove
            </button>
          </div>
          <ImageField
            label="Image"
            value={item.image || ''}
            onChange={(url) => updateItem(index, { image: url })}
            folder={imageFolder}
            hint="Drop, browse, or paste a URL — leave empty to keep the site default"
          />
          <div className="grid gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.span2 ? 'md:col-span-2' : ''}
              >
                <TextInput
                  label={field.label}
                  value={item[field.key]}
                  dir={field.dir}
                  type={field.type || 'text'}
                  multiline={field.multiline}
                  onChange={(v) =>
                    updateItem(index, {
                      [field.key]:
                        field.type === 'number'
                          ? v === ''
                            ? ''
                            : Number(v)
                          : v,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn-outline !px-4 !py-2"
        onClick={() =>
          onChange([
            ...items,
            {
              ...newItem(),
              id: `item-${Date.now()}`,
            },
          ])
        }
      >
        {addLabel}
      </button>
    </div>
  );
}

const PANELS = [
  { id: 'hero', label: 'Hero' },
  { id: 'browse', label: 'Browse intro' },
  { id: 'bundles', label: 'Bundles' },
  { id: 'scents', label: 'Scented' },
  { id: 'gifts', label: 'Gifts' },
  { id: 'homeMedia', label: 'Home media' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
  { id: 'shop', label: 'Shop banner' },
  { id: 'footer', label: 'Footer' },
];

/**
 * Partitioned site copy + media editor.
 * Each panel saves only its own Supabase `site_content` fields.
 */
export default function SiteContentEditor({
  content,
  onChange,
  onSaveSection,
  savingKey,
}) {
  const [panel, setPanel] = useState('hero');

  const setSection = (section, patch) => {
    onChange({
      ...content,
      [section]: { ...content[section], ...patch },
    });
  };

  const setField = (section, field, value) => {
    setSection(section, { [field]: value });
  };

  const pickHome = (keys) => {
    const home = content.home || {};
    const partial = {};
    keys.forEach((k) => {
      partial[k] = home[k];
    });
    return partial;
  };

  const hero = content.hero || {};
  const home = content.home || {};
  const about = content.about || {};
  const shop = content.shop || {};
  const saving = Boolean(savingKey);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-nabat-border pb-3">
        {PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPanel(p.id)}
            className={`font-nav text-xs uppercase tracking-[0.12em] px-3 py-2 transition-colors ${
              panel === p.id
                ? 'bg-nabat-primary text-white'
                : 'bg-white text-nabat-muted border border-nabat-border hover:border-nabat-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="font-nav text-sm text-nabat-muted">
        Edit one section at a time — Save updates only that part in Supabase.
        Category tiles are managed under the <strong>Categories</strong> tab.
      </p>

      {panel === 'hero' && (
        <SectionCard
          title="Hero mosaic"
          hint="Images use drag & drop / URL. Empty = built-in photo."
          saving={savingKey === 'hero'}
          onSave={() => onSaveSection('hero', content.hero || {})}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Eyebrow (EN)"
              value={hero.eyebrow}
              onChange={(v) => setField('hero', 'eyebrow', v)}
            />
            <TextInput
              label="Eyebrow (AR)"
              value={hero.eyebrowAr}
              dir="rtl"
              onChange={(v) => setField('hero', 'eyebrowAr', v)}
            />
            <TextInput
              label="Tagline (EN)"
              value={hero.tagline}
              multiline
              onChange={(v) => setField('hero', 'tagline', v)}
            />
            <TextInput
              label="Tagline (AR)"
              value={hero.taglineAr}
              dir="rtl"
              multiline
              onChange={(v) => setField('hero', 'taglineAr', v)}
            />
            <TextInput
              label="CTA (EN)"
              value={hero.cta}
              onChange={(v) => setField('hero', 'cta', v)}
            />
            <TextInput
              label="CTA (AR)"
              value={hero.ctaAr}
              dir="rtl"
              onChange={(v) => setField('hero', 'ctaAr', v)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[
              ['bamboo', 'Best seller tile'],
              ['snake', 'Snake plant tile'],
              ['pothos', 'Pothos tile'],
            ].map(([key, title]) => (
              <div key={key} className="space-y-3 border border-nabat-border p-4">
                <p className="font-nav text-xs uppercase tracking-[0.14em] text-nabat-muted">
                  {title}
                </p>
                <ImageField
                  label="Image"
                  value={hero[`${key}Image`] || ''}
                  onChange={(url) => setField('hero', `${key}Image`, url)}
                  folder="cms/hero"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Label eyebrow EN"
                    value={hero[`${key}Eyebrow`]}
                    onChange={(v) => setField('hero', `${key}Eyebrow`, v)}
                  />
                  <TextInput
                    label="Label eyebrow AR"
                    value={hero[`${key}EyebrowAr`]}
                    dir="rtl"
                    onChange={(v) => setField('hero', `${key}EyebrowAr`, v)}
                  />
                  <TextInput
                    label="Title EN"
                    value={hero[`${key}Title`]}
                    onChange={(v) => setField('hero', `${key}Title`, v)}
                  />
                  <TextInput
                    label="Title AR"
                    value={hero[`${key}TitleAr`]}
                    dir="rtl"
                    onChange={(v) => setField('hero', `${key}TitleAr`, v)}
                  />
                </div>
              </div>
            ))}

            <div className="space-y-3 border border-nabat-border p-4 lg:col-span-2">
              <p className="font-nav text-xs uppercase tracking-[0.14em] text-nabat-muted">
                Succulent trio tile
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {['trioImage1', 'trioImage2', 'trioImage3'].map((field, i) => (
                  <ImageField
                    key={field}
                    label={`Trio image ${i + 1}`}
                    value={hero[field] || ''}
                    onChange={(url) => setField('hero', field, url)}
                    folder="cms/hero"
                  />
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label="Trio eyebrow EN"
                  value={hero.trioEyebrow}
                  onChange={(v) => setField('hero', 'trioEyebrow', v)}
                />
                <TextInput
                  label="Trio eyebrow AR"
                  value={hero.trioEyebrowAr}
                  dir="rtl"
                  onChange={(v) => setField('hero', 'trioEyebrowAr', v)}
                />
                <TextInput
                  label="Trio title EN"
                  value={hero.trioTitle}
                  onChange={(v) => setField('hero', 'trioTitle', v)}
                />
                <TextInput
                  label="Trio title AR"
                  value={hero.trioTitleAr}
                  dir="rtl"
                  onChange={(v) => setField('hero', 'trioTitleAr', v)}
                />
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {panel === 'browse' && (
        <SectionCard
          title="Browse section intro"
          hint="Category tiles themselves come from the Categories tab (Supabase)."
          saving={savingKey === 'home:browse'}
          onSave={() =>
            onSaveSection(
              'home',
              pickHome(['browseLabel', 'browseTitle', 'browseQuote']),
              'home:browse'
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Section label"
              value={home.browseLabel}
              onChange={(v) => setField('home', 'browseLabel', v)}
            />
            <TextInput
              label="Section title"
              value={home.browseTitle}
              onChange={(v) => setField('home', 'browseTitle', v)}
            />
            <div className="md:col-span-2">
              <TextInput
                label="Quote"
                value={home.browseQuote}
                multiline
                onChange={(v) => setField('home', 'browseQuote', v)}
              />
            </div>
          </div>
        </SectionCard>
      )}

      {panel === 'bundles' && (
        <SectionCard
          title="Bundles"
          saving={savingKey === 'home:bundles'}
          onSave={() =>
            onSaveSection(
              'home',
              pickHome([
                'bundlesEyebrow',
                'bundlesTitle',
                'bundlesSubtitle',
                'bundles',
              ]),
              'home:bundles'
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Eyebrow"
              value={home.bundlesEyebrow}
              onChange={(v) => setField('home', 'bundlesEyebrow', v)}
            />
            <TextInput
              label="Title"
              value={home.bundlesTitle}
              onChange={(v) => setField('home', 'bundlesTitle', v)}
            />
            <div className="md:col-span-2">
              <TextInput
                label="Subtitle"
                value={home.bundlesSubtitle}
                multiline
                onChange={(v) => setField('home', 'bundlesSubtitle', v)}
              />
            </div>
          </div>
          <CardListEditor
            items={home.bundles || []}
            onChange={(bundles) => setField('home', 'bundles', bundles)}
            imageFolder="cms/bundles"
            addLabel="Add bundle"
            newItem={() => ({
              name: 'New bundle',
              nameAr: '',
              desc: '',
              descAr: '',
              image: '',
              price: 100,
              compare: 120,
              save: 10,
              to: '/shop',
            })}
            fields={[
              { key: 'name', label: 'Name EN' },
              { key: 'nameAr', label: 'Name AR', dir: 'rtl' },
              {
                key: 'desc',
                label: 'Description EN',
                multiline: true,
                span2: true,
              },
              {
                key: 'descAr',
                label: 'Description AR',
                multiline: true,
                dir: 'rtl',
                span2: true,
              },
              { key: 'price', label: 'Price', type: 'number' },
              { key: 'compare', label: 'Compare at', type: 'number' },
              { key: 'save', label: 'Save %', type: 'number' },
              { key: 'to', label: 'Link' },
            ]}
          />
        </SectionCard>
      )}

      {panel === 'scents' && (
        <SectionCard
          title="Scented corner"
          saving={savingKey === 'home:scents'}
          onSave={() =>
            onSaveSection(
              'home',
              pickHome([
                'scentEyebrow',
                'scentTitle',
                'scentSubtitle',
                'scents',
              ]),
              'home:scents'
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Eyebrow"
              value={home.scentEyebrow}
              onChange={(v) => setField('home', 'scentEyebrow', v)}
            />
            <TextInput
              label="Title"
              value={home.scentTitle}
              onChange={(v) => setField('home', 'scentTitle', v)}
            />
            <div className="md:col-span-2">
              <TextInput
                label="Subtitle"
                value={home.scentSubtitle}
                multiline
                onChange={(v) => setField('home', 'scentSubtitle', v)}
              />
            </div>
          </div>
          <CardListEditor
            items={home.scents || []}
            onChange={(scents) => setField('home', 'scents', scents)}
            imageFolder="cms/scents"
            addLabel="Add scent card"
            newItem={() => ({
              name: 'New scent',
              nameAr: '',
              desc: '',
              descAr: '',
              image: '',
              price: 45,
              to: '/shop',
            })}
            fields={[
              { key: 'name', label: 'Name EN' },
              { key: 'nameAr', label: 'Name AR', dir: 'rtl' },
              {
                key: 'desc',
                label: 'Description EN',
                multiline: true,
                span2: true,
              },
              {
                key: 'descAr',
                label: 'Description AR',
                multiline: true,
                dir: 'rtl',
                span2: true,
              },
              { key: 'price', label: 'Price', type: 'number' },
              { key: 'to', label: 'Link' },
            ]}
          />
        </SectionCard>
      )}

      {panel === 'gifts' && (
        <SectionCard
          title="Gift sets"
          saving={savingKey === 'home:gifts'}
          onSave={() =>
            onSaveSection(
              'home',
              pickHome([
                'giftsEyebrow',
                'giftsTitle',
                'giftsSubtitle',
                'gifts',
              ]),
              'home:gifts'
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Eyebrow"
              value={home.giftsEyebrow}
              onChange={(v) => setField('home', 'giftsEyebrow', v)}
            />
            <TextInput
              label="Title"
              value={home.giftsTitle}
              onChange={(v) => setField('home', 'giftsTitle', v)}
            />
            <div className="md:col-span-2">
              <TextInput
                label="Subtitle"
                value={home.giftsSubtitle}
                multiline
                onChange={(v) => setField('home', 'giftsSubtitle', v)}
              />
            </div>
          </div>
          <CardListEditor
            items={home.gifts || []}
            onChange={(gifts) => setField('home', 'gifts', gifts)}
            imageFolder="cms/gifts"
            addLabel="Add gift set"
            newItem={() => ({
              name: 'New gift',
              nameAr: '',
              desc: '',
              descAr: '',
              image: '',
              price: 200,
              compare: 240,
              parts: 'Plant, Pot, Card',
              partsAr: '',
              to: '/shop',
            })}
            fields={[
              { key: 'name', label: 'Name EN' },
              { key: 'nameAr', label: 'Name AR', dir: 'rtl' },
              {
                key: 'desc',
                label: 'Description EN',
                multiline: true,
                span2: true,
              },
              {
                key: 'descAr',
                label: 'Description AR',
                multiline: true,
                dir: 'rtl',
                span2: true,
              },
              {
                key: 'parts',
                label: 'Includes (comma-separated EN)',
                span2: true,
              },
              {
                key: 'partsAr',
                label: 'Includes AR',
                dir: 'rtl',
                span2: true,
              },
              { key: 'price', label: 'Price', type: 'number' },
              { key: 'compare', label: 'Compare at', type: 'number' },
              { key: 'to', label: 'Link', span2: true },
            ]}
          />
        </SectionCard>
      )}

      {panel === 'homeMedia' && (
        <SectionCard
          title="Home titles + media"
          hint="Featured / recent / community copy and the discount & social images."
          saving={savingKey === 'home:media'}
          onSave={() =>
            onSaveSection(
              'home',
              pickHome([
                'featuredTitle',
                'featuredSubtitle',
                'recentTitle',
                'recentSubtitle',
                'socialTitle',
                'socialSubtitle',
                'socialImage',
                'discountImage',
              ]),
              'home:media'
            )
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['featuredTitle', 'Featured title'],
              ['featuredSubtitle', 'Featured subtitle'],
              ['recentTitle', 'Recent title'],
              ['recentSubtitle', 'Recent subtitle'],
              ['socialTitle', 'Community title'],
              ['socialSubtitle', 'Community subtitle'],
            ].map(([field, label]) => (
              <div
                key={field}
                className={field.includes('Subtitle') ? 'md:col-span-2' : ''}
              >
                <TextInput
                  label={label}
                  value={home[field]}
                  multiline={field.includes('Subtitle')}
                  onChange={(v) => setField('home', field, v)}
                />
              </div>
            ))}
          </div>
          <ImageField
            label="Discount / offer background"
            value={home.discountImage || ''}
            onChange={(url) => setField('home', 'discountImage', url)}
            folder="cms/sections"
          />
          <ImageField
            label="Community / social image"
            value={home.socialImage || ''}
            onChange={(url) => setField('home', 'socialImage', url)}
            folder="cms/sections"
          />
        </SectionCard>
      )}

      {panel === 'about' && (
        <SectionCard
          title="About page"
          saving={savingKey === 'about'}
          onSave={() => onSaveSection('about', content.about || {})}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {['eyebrow', 'title', 'body', 'bodyAr'].map((field) => (
              <div
                key={field}
                className={
                  field === 'body' || field === 'bodyAr' ? 'md:col-span-2' : ''
                }
              >
                <TextInput
                  label={field}
                  value={about[field]}
                  dir={field.endsWith('Ar') ? 'rtl' : undefined}
                  multiline={field.startsWith('body')}
                  onChange={(v) => setField('about', field, v)}
                />
              </div>
            ))}
          </div>
          <ImageField
            label="About image"
            value={about.image || ''}
            onChange={(url) => setField('about', 'image', url)}
            folder="cms/pages"
          />
        </SectionCard>
      )}

      {panel === 'contact' && (
        <SectionCard
          title="Contact page"
          saving={savingKey === 'contact'}
          onSave={() => onSaveSection('contact', content.contact || {})}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {['eyebrow', 'title', 'subtitle', 'locationLabel', 'location'].map(
              (field) => (
                <div
                  key={field}
                  className={field === 'subtitle' ? 'md:col-span-2' : ''}
                >
                  <TextInput
                    label={field}
                    value={content.contact?.[field]}
                    multiline={field === 'subtitle'}
                    onChange={(v) => setField('contact', field, v)}
                  />
                </div>
              )
            )}
          </div>
        </SectionCard>
      )}

      {panel === 'shop' && (
        <SectionCard
          title="Shop banner"
          saving={savingKey === 'shop'}
          onSave={() => onSaveSection('shop', content.shop || {})}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Eyebrow"
              value={shop.bannerEyebrow}
              onChange={(v) => setField('shop', 'bannerEyebrow', v)}
            />
            <TextInput
              label="Title"
              value={shop.bannerTitle}
              onChange={(v) => setField('shop', 'bannerTitle', v)}
            />
          </div>
          <ImageField
            label="Banner image"
            value={shop.bannerImage || ''}
            onChange={(url) => setField('shop', 'bannerImage', url)}
            folder="cms/pages"
          />
        </SectionCard>
      )}

      {panel === 'footer' && (
        <SectionCard
          title="Footer"
          saving={savingKey === 'footer'}
          onSave={() => onSaveSection('footer', content.footer || {})}
        >
          <TextInput
            label="Tagline"
            value={content.footer?.tagline}
            onChange={(v) => setField('footer', 'tagline', v)}
          />
        </SectionCard>
      )}

      {saving ? null : null}
    </div>
  );
}
