// Success Response 
export const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

// Created Response
export const createdResponse = (res, message = 'Created', data = {}) => {
  return successResponse(res, 201, message, data)
}

// Paginated Response 
export const paginatedResponse = (res, message = 'Success', data = [], pagination = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || data.length,
      totalPages: pagination.totalPages || 1,
    },
  })
}

// No Content Response 
export const noContentResponse = (res) => {
  return res.status(204).send()
}
