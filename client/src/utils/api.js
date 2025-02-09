import axios from "axios";


const token=localStorage.getItem("token");

const params={
    headers: {
        'Authorization': `Bearer ${token}`, // Include your API key in the Authorization header
        'Content-Type': 'application/json', // Adjust the content type as needed
      },

} 

export const fetchDataFromApi = async (url) => {
    try {
        const { data } = await axios.get(process.env.REACT_APP_API_URL + url, params)
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const fetchDataApi = async (url) => {
    try {
        const { res} = await axios.get(process.env.REACT_APP_API_URL + url, params)
        return res;
    } catch (error) {
        console.log(error);
        return error;
    }
}


export const postData = async (url, data, isFormData = false) => {
    try {
        const headers = {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };

        const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
            method: 'POST',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};


export const editData = async (url, updatedData ) => {
    const { res } = await axios.put(`${process.env.REACT_APP_API_URL}${url}`,updatedData, params)
    return res;
}

export const deleteData = async (url ) => {
    const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}${url}`)
    return data;
}


export const uploadImage = async (url, formData) => {
    const { res } = await axios.post(process.env.REACT_APP_API_URL + url , formData)
    return res;
}


export const deleteImages = async (url,image ) => {
    const { res } = await axios.delete(`${process.env.REACT_APP_API_URL}${url}`, params,image);
    return res;
}

export const updateStockAdmin = async (productId) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/products/updateStockadmin`, 
            { productId: productId }, // Directly pass the productId
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data; // Return the response data
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error; // Rethrow the error for handling in the calling function
    }
};

