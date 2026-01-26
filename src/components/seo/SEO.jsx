import React from 'react';

const SEO = ({
  title,
  description,
  canonicalUrl,
  ogType,
  ogImage,
  keywords,
}) => {
  const defaultTitle = 'ACSES KITCoEK - Association of Computer Science and Engineering Students';
  const defaultDescription = 'Official website of the Association of Computer Science and Engineering Students (ACSES) at KIT\'s College of Engineering (Autonomous), Kolhapur (KITCoEK).';
  const defaultOgType = 'website';
  const defaultOgImage = 'https://acses-3d.pages.dev/images/ACSES_logo.png';
  const siteUrl = 'https://acses-3d.pages.dev';
  const defaultKeywords = 'ACSES, KITCoEK, KIT Kolhapur, KITCE, KIT College of Engineering, Computer Science, Engineering, Kolhapur, Student Association, CSE Department, KIT CoE Kolhapur';

  const pageTitle = title ? `${title} | ACSES` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords ? `${defaultKeywords}, ${keywords}` : defaultKeywords;
  const pageOgImage = ogImage || defaultOgImage;
  const pageCanonicalUrl = `${siteUrl}${canonicalUrl || ''}`;

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content="ACSES Tech Team" />
      <meta name="robots" content="index, follow" />
      
      {canonicalUrl && <link rel="canonical" href={pageCanonicalUrl} />}
      
      <meta property="og:type" content={ogType || defaultOgType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:url" content={pageCanonicalUrl} />
      <meta property="og:site_name" content="ACSES KITCoEK" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageOgImage} />
    </>
  );
};

export default SEO;
