import { NextRequest } from "next/server";
import { followList } from "@/lib/talentLists";

export const dynamic = "force-dynamic";
export const GET = (req: NextRequest, { params }: { params: Promise<{ username: string }> }) => followList(req, params, "followers");
