import { generateService } from '@umijs/openapi'

export default generateService({
  requestLibPath: "import request from '@/request'",
  schemaPath: 'http://localhost:8881/api/v2/api-docs',
  servicePath: "./src",
})
