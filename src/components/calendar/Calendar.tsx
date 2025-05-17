'use client';

import { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, SlotInfo, Event as RBCEvent } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ClipLoader } from "react-spinners";
import { useTheme } from "@/app/theme-context";
import { toast } from "sonner";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
}

export function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { brandColor } = useTheme();

  async function handleSelectSlot(slotInfo: SlotInfo) {
    const title = window.prompt("New Event name");
    if (title) {
      try {
        const response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            start: slotInfo.start,
            end: slotInfo.end,
            allDay: slotInfo.action === "doubleClick" ? false : slotInfo.slots?.length === 1,
          }),
        });
        if (!response.ok) throw new Error('Failed to create event');
        const newEvent = await response.json();
        setEvents([...events, newEvent]);
        toast.success('Event created successfully');
      } catch (error) {
        toast.error('Failed to create event');
      }
    }
  }

  async function handleSelectEvent(event: RBCEvent) {
    if (window.confirm(`Delete event '${event.title}'?`)) {
      try {
        const response = await fetch(`/api/calendar/events/${event.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete event');
        setEvents(events.filter(e => e.id !== event.id));
        toast.success('Event deleted successfully');
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  }

  return (
    <div className="h-[600px]">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <ClipLoader color={brandColor} size={48} />
        </div>
      ) : (
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={["month", "week", "day"]}
          popup
          className="bg-white/50 backdrop-blur-lg rounded-xl shadow-lg"
        />
      )}
    </div>
  );
} 