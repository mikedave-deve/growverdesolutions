// Single source of truth for sitewide SEO values, so canonical URLs,
// structured data, and the sitemap can never disagree on the domain.
export const SITE_URL = "https://growverdesolutions.com";
export const SITE_NAME = "Growverde Solutions";
export const DEFAULT_DESCRIPTION =
  "Growverde Solutions is a staffing and recruitment agency placing candidates in healthcare, technology, finance, legal, marketing, and HR roles nationwide.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/android-chrome-512x512.png`;

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EmploymentAgency",
  name: SITE_NAME,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  description: DEFAULT_DESCRIPTION,
  email: "info@growverdesolutions.com",
  telephone: "+1-863-243-3789",
  address: {
    "@type": "PostalAddress",
    streetAddress: "480 Congress Ave, Suite 300",
    addressLocality: "Austin",
    addressRegion: "TX",
    postalCode: "78701",
    addressCountry: "US",
  },
};
