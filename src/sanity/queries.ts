import { defineQuery } from 'next-sanity';

const companyProjection = /* groq */ `
  _id,
  "id": coalesce(slug.current, _id),
  name,
  product,
  "logo": logo.asset->_id,
  role,
  years,
  tags,
  url,
  summary,
  impact[]{ value, label },
  shots[]{
    _key,
    "id": coalesce(slug.current, _key),
    title,
    description,
    platform,
    status,
    year,
    contributions,
    tags,
    media[]{
      _key,
      _type,
      alt,
      _type == "imageFrame" => {
        "assetId": image.asset->_id,
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height
      },
      _type == "videoFrame" => {
        "url": file.asset->url,
        width,
        height
      }
    }
  }
`;

export const PORTFOLIO_QUERY = defineQuery(`{
  "settings": *[_id == "settings"][0]{
    name,
    role,
    location,
    timezone,
    headline,
    emphasis,
    summary,
    "photo": photo.asset->_id,
    photoAlt,
    photoCaption,
    email,
    links[]{ label, url },
    historyExtras[]{ years, name, role, href },
    accent,
    aurora,
    seoTitle,
    seoDescription
  },
  "home": *[_id == "home"][0]{
    sections[]{
      _key,
      _type,
      _type == "workSection" => {
        layout,
        companies[]->{ ${companyProjection} }
      },
      _type == "projectsSection" => {
        anchor,
        layout,
        groups[]{
          _key,
          title,
          items[]{ _key, name, note, "logo": logo.asset->_id, tags, url, status }
        }
      },
      _type == "sayHelloSection" => { label }
    }
  },
  "updatedAt": *[_type in ["settings", "home", "company"]] | order(_updatedAt desc)[0]._updatedAt
}`);
