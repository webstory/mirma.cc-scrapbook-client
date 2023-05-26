import { PUBLIC_API_SERVER } from '$env/static/public';

export type Provider = 'inkbunny' | 'furaffinity';

export interface SubmissionDetail {
  _id: string;

  // User metadata
  provider: Provider;
  user_id?: number;
  username: string;
  submission_id: number;

  // File metadata
  file_id: number;
  file_name: string;
  mimetype: string;
  width: number;
  height: number;
  create_datetime: string;
  create_timestamp: number;
  md5: string;

  // Submission metadata
  title: string;
  description: string;
  tags: string[];
  pools?: string[];
}

export interface ProviderConfig {
  imageUrl: string;
  signedUrl: string;
  thumbnailUrl: string;
}

export const providerMap: { [key in Provider]: ProviderConfig } = {
  inkbunny: {
    imageUrl: '/img/local/inkbunny',
    signedUrl: '/signed-url/hoya-inkbunny-pictures',
    thumbnailUrl: '/signed-url/inkbunny-thumbnails',
  },
  furaffinity: {
    imageUrl: '/img/local/furaffinity',
    signedUrl: '/signed-url/hoya-furaffinity-pictures',
    thumbnailUrl: '/signed-url/furaffinity-thumbnails',
  },
};

export const createImageObject = (s: SubmissionDetail) => {
  const provider = providerMap[s.provider];
  return {
    ...s,
    local_url: `${PUBLIC_API_SERVER}${provider.imageUrl}/${s.username}/${s.file_name}`,
    url: `${PUBLIC_API_SERVER}${provider.signedUrl}/${s.username}/${s.file_name}`,
    thumbnail_url: `${PUBLIC_API_SERVER}${provider.thumbnailUrl}/${s.username}/${s.file_name}`,
  };
};
