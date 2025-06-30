import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Truck, MapPin } from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";

interface DeliverySchedule {
  deliveryDate: Date | null;
  deliveryTimeSlot: string;
  deliveryInstructions: string;
}

interface DeliverySchedulerProps {
  onScheduleChange: (schedule: DeliverySchedule) => void;
  initialSchedule?: DeliverySchedule;
  className?: string;
}

const timeSlots = [
  { value: "morning", label: "Morning (8:00 AM - 12:00 PM)", icon: "🌅" },
  { value: "afternoon", label: "Afternoon (12:00 PM - 4:00 PM)", icon: "☀️" },
  { value: "evening", label: "Evening (4:00 PM - 8:00 PM)", icon: "🌇" },
  { value: "asap", label: "ASAP (Next Available)", icon: "⚡", premium: true }
];

export default function DeliveryScheduler({ 
  onScheduleChange, 
  initialSchedule,
  className = "" 
}: DeliverySchedulerProps) {
  const [schedule, setSchedule] = useState<DeliverySchedule>(
    initialSchedule || {
      deliveryDate: null,
      deliveryTimeSlot: "",
      deliveryInstructions: ""
    }
  );

  const updateSchedule = (updates: Partial<DeliverySchedule>) => {
    const newSchedule = { ...schedule, ...updates };
    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
  };

  // Generate available dates (today + next 7 days)
  const availableDates = Array.from({ length: 8 }, (_, i) => addDays(new Date(), i));
  
  // Check if date is disabled (past dates or fully booked)
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getTimeSlotBadge = (timeSlot: string) => {
    const slot = timeSlots.find(s => s.value === timeSlot);
    if (!slot) return null;
    
    return (
      <Badge variant={slot.premium ? "default" : "secondary"} className="ml-2">
        {slot.icon} {slot.premium ? "Premium" : "Standard"}
      </Badge>
    );
  };

  const getEstimatedDelivery = () => {
    if (!schedule.deliveryDate || !schedule.deliveryTimeSlot) return null;

    const slot = timeSlots.find(s => s.value === schedule.deliveryTimeSlot);
    if (!slot) return null;

    let estimatedTime;
    switch (schedule.deliveryTimeSlot) {
      case "morning":
        estimatedTime = setMinutes(setHours(schedule.deliveryDate, 10), 0);
        break;
      case "afternoon":
        estimatedTime = setMinutes(setHours(schedule.deliveryDate, 14), 0);
        break;
      case "evening":
        estimatedTime = setMinutes(setHours(schedule.deliveryDate, 18), 0);
        break;
      case "asap":
        estimatedTime = addDays(new Date(), 0.5); // 12 hours from now
        break;
      default:
        return null;
    }

    return estimatedTime;
  };

  const estimatedDelivery = getEstimatedDelivery();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery Scheduling
        </CardTitle>
        <CardDescription>
          Choose when you'd like your groceries delivered
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Delivery Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {schedule.deliveryDate ? (
                  format(schedule.deliveryDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={schedule.deliveryDate || undefined}
                onSelect={(date) => updateSchedule({ deliveryDate: date || null })}
                disabled={isDateDisabled}
                initialFocus
                fromDate={new Date()}
                toDate={addDays(new Date(), 7)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Slot Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Delivery Time</Label>
          <Select
            value={schedule.deliveryTimeSlot}
            onValueChange={(value) => updateSchedule({ deliveryTimeSlot: value })}
            disabled={!schedule.deliveryDate}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{slot.label}</span>
                    {slot.premium && (
                      <Badge variant="default" className="ml-2">
                        +KSh 150
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {schedule.deliveryTimeSlot && getTimeSlotBadge(schedule.deliveryTimeSlot)}
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Estimated Delivery</span>
            </div>
            <p className="text-green-700 mt-1">
              {format(estimatedDelivery, "PPP 'at' p")}
            </p>
          </div>
        )}

        {/* Delivery Instructions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Delivery Instructions (Optional)</Label>
          <Textarea
            placeholder="e.g., Leave at front door, Ring doorbell twice, Apartment 2B..."
            value={schedule.deliveryInstructions}
            onChange={(e) => updateSchedule({ deliveryInstructions: e.target.value })}
            className="min-h-[80px]"
          />
          <p className="text-xs text-gray-500">
            Help our delivery person find you and deliver your order safely
          </p>
        </div>

        {/* Delivery Areas Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Delivery Areas</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Nairobi CBD - Free delivery</p>
            <p>• Westlands, Karen, Kilimani - KSh 150</p>
            <p>• Kasarani, Embakasi - KSh 200</p>
            <p>• Kiambu, Machakos - KSh 300</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}