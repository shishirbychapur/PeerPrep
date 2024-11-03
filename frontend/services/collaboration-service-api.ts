import axiosClient from './axios-middleware'
import { ICollabSession } from '@/types/collaboration-api'

const axiosInstance = axiosClient.collaborationServiceAPI

// PUT /collab
export const createCollabSession = async (data: ICollabSession): Promise<number | undefined> => {
    try {
        const response = await axiosInstance.put(`/collab`, data)
        return response.status
    } catch (error) {
        console.error(error)
    }
}
