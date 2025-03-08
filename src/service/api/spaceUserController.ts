// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addSpaceUser POST /api/space/add/user */
export async function addSpaceUserUsingPost(
  body: API.SpaceUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/space/add/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listMembers POST /api/space/list/members/${param0} */
export async function listMembersUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listMembersUsingPOSTParams,
  options?: { [key: string]: any }
) {
  const { spaceId: param0, ...queryParams } = params
  return request<API.BaseResponseListSpaceMemberVo_>(`/api/space/list/members/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** listMyTeamSpace POST /api/space/list/my */
export async function listMyTeamSpaceUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSpaceUserVO_>('/api/space/list/my', {
    method: 'POST',
    ...(options || {}),
  })
}
