"use client";
// Client entry points for the /haramain lesson and certificate routes (the course definition stays on the client).
import { HARAMAIN_COURSE } from "@/lib/learn/haramain/lessons";
import { CourseCertificateScreen, CourseLessonScreen } from "@/components/learn/coursekit/CourseKit";

export function HaramainLesson({ id }: { id: string }) { return <CourseLessonScreen key={id} def={HARAMAIN_COURSE} id={id} />; }
export function HaramainCertificate() { return <CourseCertificateScreen def={HARAMAIN_COURSE} />; }
