import React from "react";
import { Link, useParams } from "@tanstack/react-router";
import { orders } from "../data/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const OrderDetail: React.FC = () => {
  const { id } = useParams({ from: "/_authenticated/orders/$id" });
  const order = orders.find((order) => order.id === id);

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 w-96">
          <CardTitle className="mb-4 text-red-500">Order not found</CardTitle>
          <Button variant="outline" asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate subtotal
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Mock order date
  const orderDate = "September 12, 2024 at 9:25 am from Matrixify (via import)";

  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="icon" asChild className="w-8 h-8">
            <Link to="/orders">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M5 12l14 0"></path>
                <path d="M5 12l6 6"></path>
                <path d="M5 12l6 -6"></path>
              </svg>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Order #{id}</h1>
        </div>
        
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-green-700 bg-green-50 hover:bg-green-100">Paid</Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">Unfulfilled</Badge>
            <span className="text-sm text-gray-500">Archived</span>
            <span className="text-sm text-gray-500">{orderDate}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Refund</Button>
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              Print 
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M6 9l6 6l6 -6"></path>
              </svg>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              More actions 
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M6 9l6 6l6 -6"></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Unfulfilled Items Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-amber-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"></path>
                    <path d="M12 12l8 -4.5"></path>
                    <path d="M12 12l0 9"></path>
                    <path d="M12 12l-8 -4.5"></path>
                  </svg>
                </div>
                <CardTitle className="text-base">Unfulfilled Items ({order.items.length})</CardTitle>
              </div>
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                </svg>
              </Button>
            </CardHeader>
            
            <Separator />
            
            <div className="p-4">
              <div className="mb-2">
                <span className="text-sm font-medium">Delivery method</span>
                <p className="text-sm">Shipping</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              {order.items.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path d="M12 5l0 14"></path>
                          <path d="M5 12l14 0"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">SKU: {`VAYU-${index}-SKU`}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-20 text-right">${item.price.toFixed(2)}</span>
                      <span className="w-8 text-center text-gray-500">×</span>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <span className="w-24 font-medium text-right">${(item.price * item.quantity).toFixed(2)} USD</span>
                    </div>
                  </div>
                  {index < order.items.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
            
            <Separator />
            
            <div className="flex justify-end p-4">
              <Button className="text-white bg-black hover:bg-gray-800">
                Fulfill items
              </Button>
            </div>
          </Card>
          
          {/* Payment Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center py-4">
              <div className="p-2 mr-2 bg-gray-100 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"></path>
                  <path d="M3 10l18 0"></path>
                  <path d="M7 15l.01 0"></path>
                  <path d="M11 15l2 0"></path>
                </svg>
              </div>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            
            <Separator />
            
            <div>
              <div className="flex justify-between p-4">
                <span className="text-sm">Subtotal</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{order.items.length} items</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between p-4">
                <span className="font-medium">Total</span>
                <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between p-4">
                <span className="text-sm">Paid</span>
                <span className="font-medium text-green-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </Card>
          
          {/* Metafields Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metafields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">QTY</label>
                <Input type="text" className="w-full" />
              </div>
              
              <Button variant="link" className="h-auto p-0">View all</Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Notes Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">Notes</CardTitle>
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
                  <path d="M13.5 6.5l4 4"></path>
                </svg>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">No notes from customer</p>
            </CardContent>
          </Card>
          
          {/* Customer Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                </svg>
                <CardTitle className="text-base">Customer</CardTitle>
              </div>
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                </svg>
              </Button>
            </CardHeader>
            
            <CardContent className="pb-3">
              <a href="#" className="font-medium text-blue-600 hover:underline">Alexander Wolf</a>
              <p className="text-sm text-gray-500">1 order</p>
            </CardContent>
            
            <Separator />
            
            <div className="p-4">
              <h4 className="mb-2 text-sm font-medium">Contact information</h4>
              <p className="text-sm text-gray-500">No email provided</p>
              <a href="tel:+19176573999" className="flex items-center mt-1 text-sm text-blue-600 hover:underline">
                +1 917-657-3999
              </a>
            </div>
            
            <Separator />
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Shipping address</h4>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"></path>
                  </svg>
                </Button>
              </div>
              <address className="text-sm not-italic">
                <p>Alexander Wolf</p>
                <p>300 W 53RD ST, APT 6M</p>
                <p>NEW YORK NY 10019</p>
                <p>United States</p>
                <a href="tel:+19176573999" className="block mt-1 text-blue-600 hover:underline">+1 917-657-3999</a>
              </address>
            </div>
            
            <Separator />
            
            <div className="p-4">
              <h4 className="mb-2 text-sm font-medium">Billing address</h4>
              <p className="text-sm text-gray-500">Same as shipping address</p>
            </div>
          </Card>
          
          {/* Conversion Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversion summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-gray-500">There aren't any conversion details available for this order.</p>
              <Button variant="link" className="h-auto p-0">Learn more</Button>
            </CardContent>
          </Card>
          
          {/* Order Risk Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">Order risk</CardTitle>
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                  <path d="M12 8l.01 0"></path>
                  <path d="M11 12l1 0l0 4l1 0"></path>
                </svg>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Analysis not available</p>
            </CardContent>
          </Card>
          
          {/* Tags Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                  <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.414 7.414a2 2 0 0 0 2.828 0l5.172 -5.172a2 2 0 0 0 0 -2.828l-7.414 -7.414a2 2 0 0 0 -1.414 -.586h-5.172a2 2 0 0 0 -2 2z"></path>
                </svg>
                <CardTitle className="text-base">Tags</CardTitle>
              </div>
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
                  <path d="M13.5 6.5l4 4"></path>
                </svg>
              </Button>
            </CardHeader>
            <CardContent>
              <Input type="text" placeholder="VIP, sale, summer" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;