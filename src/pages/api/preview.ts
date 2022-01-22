import Prismic from '@prismicio/client';
import { ApiOptions } from '@prismicio/client/types/Api';
import { DefaultClient } from '@prismicio/client/types/client';
import { Document } from '@prismicio/client/types/documents';
import { NextApiRequest, NextApiResponse } from 'next';

function createClientOptions(
  req = null,
  prismicAccessToken = null
): ApiOptions {
  const reqOption = req ? { req } : {};
  const accessTokenOption = prismicAccessToken
    ? { accessToken: prismicAccessToken }
    : {};
  return {
    ...reqOption,
    ...accessTokenOption,
  };
}

function Client(req = null): DefaultClient {
  return Prismic.client(
    process.env.PRISMIC_API_ENDPOINT,
    createClientOptions(req, process.env.PRISMIC_ACCESS_TOKEN)
  );
}

function linkResolver(doc: Document): string {
  if (doc.type === 'publications') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

export default async function Preview(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { token: ref, documentId } = req.query;
  const redirectUrl = await Client(req)
    .getPreviewResolver(String(ref), String(documentId))
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });

  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  );
  res.end();
}
