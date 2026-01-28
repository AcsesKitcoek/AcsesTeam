import React, { useEffect } from 'react';

const SEO = ({
  title,
  description,
  canonicalUrl,
  ogType,
  ogImage,
  keywords,
}) => {
  const defaultTitle = 'ACSES KITCoEK | Association of Computer Science & Engineering Students, KIT Kolhapur';
  const defaultDescription = 'Official website of ACSES (Association of Computer Science and Engineering Students) at KIT\'s College of Engineering (Autonomous), Kolhapur. Explore our 3D campus, events, and teams.';
  const defaultOgType = 'website';
  const defaultOgImage = 'https://acseskitcoek.pages.dev/images/ACSES_logo.png';
  const siteUrl = 'https://acseskitcoek.pages.dev';
  const defaultKeywords = 'ACSES, KITCoEK, KIT Kolhapur, KITCE, KIT College of Engineering, Computer Science, Engineering, Kolhapur, Student Association, CSE Department, KIT CoE Kolhapur';

  const pageTitle = title ? `${title} | ACSES` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords ? `${defaultKeywords}, ${keywords}` : defaultKeywords;
  const pageOgImage = ogImage || defaultOgImage;
  const pageCanonicalUrl = `${siteUrl}${canonicalUrl || ''}`;

  useEffect(() => {
    // Update Title
    document.title = pageTitle;

    // Helper to update meta tags
    const updateMeta = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        
        // Parse selector to set initial attributes (basic support)
        if (selector.includes('name=')) element.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
        if (selector.includes('property=')) element.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
        
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Update Metas
    updateMeta('meta[name="description"]', 'content', pageDescription);
    updateMeta('meta[name="keywords"]', 'content', pageKeywords);
    
    updateMeta('meta[property="og:title"]', 'content', pageTitle);
    updateMeta('meta[property="og:description"]', 'content', pageDescription);
    updateMeta('meta[property="og:image"]', 'content', pageOgImage);
    updateMeta('meta[property="og:url"]', 'content', pageCanonicalUrl);
    updateMeta('meta[property="og:type"]', 'content', ogType || defaultOgType);
    
    updateMeta('meta[name="twitter:title"]', 'content', pageTitle);
    updateMeta('meta[name="twitter:description"]', 'content', pageDescription);
    updateMeta('meta[name="twitter:image"]', 'content', pageOgImage);
    
    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', pageCanonicalUrl);
    }
  }, [pageTitle, pageDescription, pageKeywords, pageOgImage, pageCanonicalUrl, ogType, defaultOgType]);

  return null;
};

export default SEO;
