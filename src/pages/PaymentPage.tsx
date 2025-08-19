import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Home, Loader2 } from 'lucide-react';
import { calculateMixedPayment, formatPrice } from '@/utils/paymentCalculations';
import { PropertyCategory, getPropertyMainImage } from '@/types/property';

// Define the form schema with Zod
const paymentFormSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  zipCode: z.string().min(5, { message: 'Zip code is required' }),
  cardNumber: z.string().min(16, { message: 'Valid card number is required' }),
  expiryDate: z.string().min(5, { message: 'Valid expiry date is required (MM/YY)' }),
  cvv: z.string().min(3, { message: 'Valid CVV is required' }),
  leaseDuration: z.string().min(1, { message: 'Lease duration is required' }),
  moveInDate: z.string().min(1, { message: 'Move-in date is required' }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const PaymentPage = () => {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Filter cart items by property type
  const rentalProperties = cartItems.filter(item => item.property.tag === PropertyCategory.FOR_RENT);
  const saleProperties = cartItems.filter(item => item.property.tag === PropertyCategory.FOR_SALE);
  
  // Calculate payment breakdown using utility functions
  const paymentBreakdown = calculateMixedPayment(
    rentalProperties.map(item => item.property),
    saleProperties.map(item => item.property)
  );
  
  const isRentalPayment = paymentBreakdown.hasRentals;
  const isSalePayment = paymentBreakdown.hasSales;
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      fullName: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      leaseDuration: '12',
      moveInDate: '',
      termsAccepted: false,
    },
  });

  // Redirect if no properties in cart
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('No properties in your cart');
      navigate('/dashboard/cart');
    }
  }, [cartItems, navigate]);



  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real application, you would process the payment here
      // For now, we'll just simulate a successful payment
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear the cart after successful payment
      await clearCart();
      
      if (isRentalPayment) {
        toast.success('Payment successful! Your rental is confirmed.');
      } else {
        toast.success('Payment successful! Your property purchase is confirmed.');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 lg:mb-8">
          {isRentalPayment ? 'Complete Your Rental Payment' : 'Complete Your Property Purchase'}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Order Summary - Show at top on mobile, right side on desktop */}
          <div className="order-first lg:order-last lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{isRentalPayment ? 'Rental Summary' : 'Purchase Summary'}</CardTitle>
                <CardDescription>
                  {isRentalPayment ? 'Review your rental properties' : 'Review your property purchases'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Rental Properties */}
                {rentalProperties.map((item) => (
                  <div key={item.id} className="flex gap-3 md:gap-4 pb-4 border-b border-gray-100">
                    <div className="flex-shrink-0">
                      <img 
                        src={getPropertyMainImage(item.property)} 
                        alt={item.property.title}
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm md:text-base">{item.property.title}</h4>
                      <div className="text-xs md:text-sm text-gray-500">
                        <MapPin size={12} className="inline-block mr-1" />
                        {item.property.location}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 mt-1">
                        <Home size={12} className="inline-block mr-1" />
                        <span>{item.property.beds} beds • {item.property.baths} baths</span>
                      </div>
                      <div className="font-medium text-real-blue mt-1 md:mt-2 text-sm md:text-base">
                        {formatPrice(item.property.price)}/month
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Sale Properties */}
                {saleProperties.map((item) => (
                  <div key={item.id} className="flex gap-3 md:gap-4 pb-4 border-b border-gray-100">
                    <div className="flex-shrink-0">
                      <img 
                        src={getPropertyMainImage(item.property)} 
                        alt={item.property.title}
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm md:text-base">{item.property.title}</h4>
                      <div className="text-xs md:text-sm text-gray-500">
                        <MapPin size={12} className="inline-block mr-1" />
                        {item.property.location}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 mt-1">
                        <Home size={12} className="inline-block mr-1" />
                        <span>{item.property.beds} beds • {item.property.baths} baths</span>
                      </div>
                      <div className="font-medium text-real-blue mt-1 md:mt-2 text-sm md:text-base">
                        {formatPrice(item.property.price)} (50% down: {formatPrice(item.property.price / 2)})
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 space-y-2">
                  {isRentalPayment && (
                    <>
                      <div className="flex justify-between text-sm md:text-base">
                        <span>Monthly Rent:</span>
                        <span>{formatPrice(paymentBreakdown.rental?.monthlyRent || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm md:text-base">
                        <span>Security Deposit:</span>
                        <span>{formatPrice(paymentBreakdown.rental?.securityDeposit || 0)}</span>
                      </div>
                      <div className="flex justify-between mb-2 text-sm md:text-base">
                        <span>Application Fee:</span>
                        <span>{formatPrice(paymentBreakdown.rental?.applicationFee || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-sm md:text-base">
                        <span>Total Due Today:</span>
                        <span>{formatPrice(paymentBreakdown.rental?.total || 0)}</span>
                      </div>
                    </>
                  )}
                  
                  {isSalePayment && (
                    <>
                      <div className="flex justify-between text-sm md:text-base">
                        <span>Down Payment (50%):</span>
                        <span>{formatPrice(paymentBreakdown.sale?.downPayment || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm md:text-base">
                        <span>Processing Fee:</span>
                        <span>{formatPrice(paymentBreakdown.sale?.processingFee || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-sm md:text-base">
                        <span>Total Due Today:</span>
                        <span>{formatPrice(paymentBreakdown.sale?.total || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Payment Form */}
          <div className="order-last lg:order-first lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  {isRentalPayment 
                    ? 'Enter your payment information to complete your rental' 
                    : 'Enter your payment information to complete your property purchase'
                  }
                </CardDescription>
              </CardHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-5 md:space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base md:text-lg font-semibold">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="text-sm md:text-base" />
                              </FormControl>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} className="text-sm md:text-base" />
                              </FormControl>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm md:text-base">Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} className="text-sm md:text-base" />
                            </FormControl>
                            <FormMessage className="text-xs md:text-sm" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-base md:text-lg font-semibold">Billing Address</h3>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm md:text-base">Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} className="text-sm md:text-base" />
                            </FormControl>
                            <FormMessage className="text-xs md:text-sm" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} className="text-sm md:text-base" />
                              </FormControl>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} className="text-sm md:text-base" />
                              </FormControl>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">Zip Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} className="text-sm md:text-base" />
                              </FormControl>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-base md:text-lg font-semibold">Payment Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm md:text-base">Card Number</FormLabel>
                            <FormControl>
                              <Input placeholder="1234 5678 9012 3456" {...field} className="text-sm md:text-base" />
                            </FormControl>
                            <FormMessage className="text-xs md:text-sm" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">Expiry Date</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/YY" {...field} className="text-sm md:text-base" />
                              </FormControl>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">CVV</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} className="text-sm md:text-base" />
                              </FormControl>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Lease Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="leaseDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">Lease Duration</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="text-sm md:text-base">
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="6" className="text-sm md:text-base">6 months</SelectItem>
                                  <SelectItem value="12" className="text-sm md:text-base">12 months</SelectItem>
                                  <SelectItem value="24" className="text-sm md:text-base">24 months</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="moveInDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm md:text-base">Move-in Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  className="text-sm md:text-base"
                                />
                              </FormControl>
                              <FormMessage className="text-xs md:text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm md:text-base">
                              I accept the <span className="text-primary hover:underline cursor-pointer">terms and conditions</span>
                            </FormLabel>
                            <FormMessage className="text-xs md:text-sm" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full text-sm md:text-base" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Complete Payment ({formatPrice(paymentBreakdown.totalAmount)})</>  
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;