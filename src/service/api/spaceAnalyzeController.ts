// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** getSpaceVoById POST /api/space/analyze/category */
export async function getSpaceVoByIdUsingPost2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceVoByIdUsingPOST2Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceCategoryAnalyzeResponse_>('/api/space/analyze/category', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** getSpaceVoById POST /api/space/analyze/rank */
export async function getSpaceVoByIdUsingPost1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceVoByIdUsingPOST1Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpace_>('/api/space/analyze/rank', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** getSpaceVoById POST /api/space/analyze/tag */
export async function getSpaceVoByIdUsingPost3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceVoByIdUsingPOST3Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceTagAnalyzeResponse_>('/api/space/analyze/tag', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** getSpaceVoById POST /api/space/analyze/usage */
export async function getSpaceVoByIdUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceVoByIdUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpaceUsageAnalyzeResponse_>('/api/space/analyze/usage', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** getSpaceVoById POST /api/space/analyze/user */
export async function getSpaceVoByIdUsingPost4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSpaceVoByIdUsingPOST4Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceUserAnalyzeResponse_>('/api/space/analyze/user', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
