// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** listMyTeamSpace POST /api/space/list/my */
export async function listMyTeamSpaceUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceUserVO_>('/api/space/list/my', {
    method: 'POST',
    ...(options || {}),
  })
}
