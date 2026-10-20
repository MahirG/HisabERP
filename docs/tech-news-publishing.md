# Ethiopia Tech News publishing
The company site is the canonical source. ERP mirrors each article with a cross-domain canonical; its index has its own canonical. No second database, credential, or authentication system is introduced.
## Routes
Company: /news, /news/[slug], /news/rss.xml, /news/feed.json.
ERP: /resources/tech-news and equivalent nested routes. This public resources path uses the existing marketing/session exemptions, keeping authenticated workspace routes untouched.
## Weekly update
1. Research fresh evidence; distinguish event dates from report dates. Link accessible primary sources when possible. Clearly label procurement mirrors and unverified amendment status.
2. Add a unique dated edition to src/news/editions.json in MahirG/Hisab and the identical edition to news/editions.json in MahirG/HisabERP. Preserve older editions, URLs, real publication dates and source links.
3. Avoid fabricated credentials, claims, authors and imagery. Use concise original summaries; do not reproduce copyrighted reports. Keep private Hisab bid strategy out of public editions.
4. Run node scripts/validate-news.mjs and repository type/build checks. Review the diff and publish using the authorized deployment connection.
5. Verify both live article URLs, RSS, metadata and canonical tags. Include those URLs in the existing Monday chat briefing only after publication is confirmed.
No automatic publishing has been activated by this source change. The live deployment projects for the two target domains must first be connected and verified, then the existing Hisab Ethiopia Market Brief task can be updated to use this workflow. Never create a second task or claim a failed publish succeeded.
## SEO and corrections
Article canonical: https://www.hisabtechnologies.com/news/[slug]. NewsArticle and BreadcrumbList JSON-LD, unique metadata, share cards, company article sitemap entries and RSS are included. ERP mirror article URLs are deliberately omitted from its sitemap to avoid submitting noncanonical copies.
Editorial graphics are code-native, lightweight illustrations. Keep dates explicit; verify expired bids before republishing them. Update updatedAt only for substantive edits and note material corrections.

