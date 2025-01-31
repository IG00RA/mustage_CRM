export interface Text {
  id: number;
  Hero1stBlock?: string;
  Hero1stBlockHeader?: string;
  Hero2dBlock?: string;
  Hero2ndBlockHeader?: string;
  locale?: string;
  MainYoutubeVideoID?: string;
}

const host = process.env.NEXT_PUBLIC_ADMIN_HOST;

export async function fetchData(locale: string): Promise<Text> {
  let lang = locale;
  if (locale === 'uk') {
    lang = 'uk-UA';
  }
  const url = `${host}/api/main-page-elements/?locale=${lang}&populate=*`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch vacancy: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0];
}
