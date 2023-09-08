"use client";
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const ApiInfoPage = ({ params }: { params: { api_key: string } }) => {

    const { api_key } = params;

    const [data, setData] = useState({
        data: ""
    })
    const [loading, setLoading] = useState(false);

    const fetchdata = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/endpoint", {
                headers: {
                    api_key: params.api_key
                }
            })
            setData(response.data)
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchdata();
    }, [api_key])

    return (
        <>
            {
                loading ? (
                    <div>Loading Data...</div>
                ) : (
                    <div>Secret Key: {data.data}</div>
                )
            }
        </>
    )
}

export default ApiInfoPage