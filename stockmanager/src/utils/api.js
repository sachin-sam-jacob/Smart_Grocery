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
        const { data } = await axios.get(process.env.REACT_APP_BASE_URL + url,params)
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}


export const uploadImage = async (url, formData) => {
    const { res } = await axios.post(process.env.REACT_APP_BASE_URL + url , formData)
    return res;
}

export const postData = async (url, formData) => {

    try {
        const response = await fetch(process.env.REACT_APP_BASE_URL + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
           
            body: JSON.stringify(formData)
        });


      

        if (response.ok) {
            const data = await response.json();
            //console.log(data)
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
    }


}


export const editData = async (url, updatedData ) => {
    const { res } = await axios.put(`${process.env.REACT_APP_BASE_URL}${url}`,updatedData)
    return res;
}

export const deleteData = async (url ) => {
    const { res } = await axios.delete(`${process.env.REACT_APP_BASE_URL}${url}`,params)
    return res;
}


export const deleteImages = async (url,image ) => {
    const { res } = await axios.delete(`${process.env.REACT_APP_BASE_URL}${url}`,image);
    return res;
}

export const updateData = async (url, updatedData) => {
    try {
        const { data } = await axios.put(
            `${process.env.REACT_APP_BASE_URL}${url}`,
            updatedData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return data; // Return the response data
    } catch (error) {
        console.error('Error updating data:', error);
        return error.response?.data; // Return error response if available
    }
};

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