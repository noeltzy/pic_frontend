// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** genPictureCreateTask POST /api/ai/picture/gen_picture/create_task */
export async function genPictureCreateTaskUsingPost(
  body: API.GenPictureRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseCreateTaskResponse_>('/api/ai/picture/gen_picture/create_task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getGenPictureTask GET /api/ai/picture/gen_picture/get_task */
export async function getGenPictureTaskUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getGenPictureTaskUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseImageGenerationResponse_>('/api/ai/picture/gen_picture/get_task', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** getGenPictureTaskV2 GET /api/ai/picture/gen_picture/get_task/v2 */
export async function getGenPictureTaskV2UsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getGenPictureTaskV2UsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseImageGenTask_>('/api/ai/picture/gen_picture/get_task/v2', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** genPictureCreateTaskV2 POST /api/ai/picture/gen_picture/get_task/v2 */
export async function genPictureCreateTaskV2UsingPost(
  body: API.GenPictureTaskRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseImageGenTask_>('/api/ai/picture/gen_picture/get_task/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** createPictureOutPaintingTask POST /api/ai/picture/out_painting/create_task */
export async function createPictureOutPaintingTaskUsingPost(
  body: API.CreatePictureOutPaintingTaskRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseCreateTaskResponse_>('/api/ai/picture/out_painting/create_task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getPictureOutPaintingTask GET /api/ai/picture/out_painting/get_task */
export async function getPictureOutPaintingTaskUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureOutPaintingTaskUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseGetOutPaintingTaskResponse_>(
    '/api/ai/picture/out_painting/get_task',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    }
  )
}
