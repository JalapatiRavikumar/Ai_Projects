import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { getProductsList } from '../actions/productActions'
import Message from '../components/Message'
import { Spinner, Row, Col } from 'react-bootstrap'
import Product from '../components/Product'
import { CREATE_PRODUCT_RESET } from '../constants'


function ProductsListPage() {
    const location = useLocation()
    const dispatch = useDispatch()

    const productsListReducer = useSelector(state => state.productsListReducer)
    const { loading, error, products } = productsListReducer

    const searchQuery = useMemo(() => {
        const params = new URLSearchParams(location.search)
        return (params.get('searchTerm') || '').trim().toLowerCase()
    }, [location.search])

    useEffect(() => {
        dispatch(getProductsList())
        dispatch({ type: CREATE_PRODUCT_RESET })
    }, [dispatch, location.pathname])

    const productList = Array.isArray(products) ? products : []
    const filteredProducts = searchQuery
        ? productList.filter((item) => item.name.toLowerCase().includes(searchQuery))
        : productList

    const showNothingMessage = () => {
        if (loading) {
            return null
        }

        return (
            <Message variant='info'>
                {searchQuery ? 'No products match your search.' : 'Nothing to show'}
            </Message>
        )
    }

    return (
        <div>
            {error && <Message variant='danger'>{error}</Message>}
            {loading && productList.length === 0 && (
                <span style={{ display: "flex" }}>
                    <h5>Getting Products</h5>
                    <span className="ml-2">
                        <Spinner animation="border" />
                    </span>
                </span>
            )}
            <div>
                <Row>
                    {filteredProducts.length === 0
                        ? showNothingMessage()
                        : filteredProducts.map((product) => (
                            <Col key={product.id} sm={12} md={6} lg={4} xl={3}>
                                <div className="mx-2">
                                    <Product product={product} />
                                </div>
                            </Col>
                        ))}
                </Row>
            </div>
        </div>
    )
}

export default ProductsListPage
