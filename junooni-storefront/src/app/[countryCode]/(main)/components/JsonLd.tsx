// src/components/JsonLd.tsx
export default function JsonLd({ data }: { data: object | object[] }) {
  const schema = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}