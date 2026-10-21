"use client";
// Client entry points for the /abrahamic lesson and certificate routes (the course definition stays on the client).
import { ABRAHAMIC_COURSE } from "@/lib/learn/abrahamic/lessons";
import { CourseCertificateScreen, CourseLessonScreen } from "@/components/learn/coursekit/CourseKit";

export function AbrahamicLesson({ id }: { id: string }) { return <CourseLessonScreen key={id} def={ABRAHAMIC_COURSE} id={id} />; }
export function AbrahamicCertificate() { return <CourseCertificateScreen def={ABRAHAMIC_COURSE} />; }
