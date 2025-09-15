namespace minecraft.util {

    public class AxisAlignedBB
    {
        minX: number;
        minY: number;
        minZ: number;
        maxX: number;
        maxY: number;
        maxZ: number;

        constructor(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number);
        constructor(pos1: BlockPos, pos2: BlockPos);
        constructor(
            x1: number | BlockPos,
            y1: number | BlockPos,
            z1?: number,
            x2?: number,
            y2?: number,
            z2?: number
        ) {
            if (x1 instanceof BlockPos && y1 instanceof BlockPos) {
                this.minX = x1.getX();
                this.minY = x1.getY();
                this.minZ = x1.getZ();
                this.maxX = y1.getX();
                this.maxY = y1.getY();
                this.maxZ = y1.getZ();
            } else if (
                typeof x1 === 'number' &&
                typeof y1 === 'number' &&
                typeof z1 === 'number' &&
                typeof x2 === 'number' &&
                typeof y2 === 'number' &&
                typeof z2 === 'number'
            ) {
                this.minX = Math.min(x1, x2);
                this.minY = Math.min(y1, y2);
                this.minZ = Math.min(z1, z2);
                this.maxX = Math.max(x1, x2);
                this.maxY = Math.max(y1, y2);
                this.maxZ = Math.max(z1, z2);
            } else {
                throw new Error('Invalid constructor arguments for Axis Aligned Bounding Box');
            }
        }

        /**
         * Adds the coordinates to the bounding box extending it if the point lies outside the current ranges.
         * @returns {AxisAlignedBB} A new axis aligned bounding box
         */
        public addCoord(x: number, y: number, z: number): AxisAlignedBB
        {
            let d0: number = this.minX;
            let d1: number = this.minY;
            let d2: number = this.minZ;
            let d3: number = this.maxX;
            let d4: number = this.maxY;
            let d5: number = this.maxZ;

            if (x < 0.0)
            {
                d0 += x;
            }
            else if (x > 0.0)
            {
                d3 += x;
            }

            if (y < 0.0)
            {
                d1 += y;
            }
            else if (y > 0.0)
            {
                d4 += y;
            }

            if (z < 0.0)
            {
                d2 += z;
            }
            else if (z > 0.0)
            {
                d5 += z;
            }

            return new AxisAlignedBB(d0, d1, d2, d3, d4, d5);
        }

        /**
         * Returns a bounding box expanded by the specified vector (if negative numbers are given it will shrink).
         * @returns {AxisAlignedBB} A new axis aligned bounding box
         */
        public expand(x: number, y: number, z: number): AxisAlignedBB
        {
            let d0: number = this.minX - x;
            let d1: number = this.minY - y;
            let d2: number = this.minZ - z;
            let d3: number = this.maxX + x;
            let d4: number = this.maxY + y;
            let d5: number = this.maxZ + z;
            return new AxisAlignedBB(d0, d1, d2, d3, d4, d5);
        }

        public union(other: AxisAlignedBB): AxisAlignedBB
        {
            let d0: number = Math.min(this.minX, other.minX);
            let d1: number = Math.min(this.minY, other.minY);
            let d2: number = Math.min(this.minZ, other.minZ);
            let d3: number = Math.max(this.maxX, other.maxX);
            let d4: number = Math.max(this.maxY, other.maxY);
            let d5: number = Math.max(this.maxZ, other.maxZ);
            return new AxisAlignedBB(d0, d1, d2, d3, d4, d5);
        }

        /**
         * @returns {AxisAlignedBB} an AABB with corners x1, y1, z1 and x2, y2, z2
         */
        public static fromBounds(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): AxisAlignedBB
        {
            let d0: number = Math.min(x1, x2);
            let d1: number = Math.min(y1, y2);
            let d2: number = Math.min(z1, z2);
            let d3: number = Math.max(x1, x2);
            let d4: number = Math.max(y1, y2);
            let d5: number = Math.max(z1, z2);
            return new AxisAlignedBB(d0, d1, d2, d3, d4, d5);
        }

        /**
         * Offsets the current bounding box by the specified coordinates.
         * @returns {AxisAlignedBB} A new axis aligned bounding box
         */
        public offset(x: number, y: number, z: number): AxisAlignedBB
        {
            return new AxisAlignedBB(this.minX + x, this.minY + y, this.minZ + z, this.maxX + x, this.maxY + y, this.maxZ + z);
        }

        /**
         * if instance and the argument bounding boxes overlap in the Y and Z dimensions, calculate the offset between them
         * in the X dimension.  return var2 if the bounding boxes do not overlap or if var2 is closer to 0 then the
         * calculated offset.  Otherwise return the calculated offset.
         */
        public calculateXOffset(other: AxisAlignedBB, offsetX: number): number
        {
            if (other.maxY > this.minY && other.minY < this.maxY && other.maxZ > this.minZ && other.minZ < this.maxZ)
            {
                if (offsetX > 0.0 && other.maxX <= this.minX)
                {
                    let d1: number = this.minX - other.maxX;

                    if (d1 < offsetX)
                    {
                        offsetX = d1;
                    }
                }
                else if (offsetX < 0.0 && other.minX >= this.maxX)
                {
                    let d0: number = this.maxX - other.minX;

                    if (d0 > offsetX)
                    {
                        offsetX = d0;
                    }
                }

                return offsetX;
            }
            else
            {
                return offsetX;
            }
        }

        /**
         * if instance and the argument bounding boxes overlap in the X and Z dimensions, calculate the offset between them
         * in the Y dimension.  return var2 if the bounding boxes do not overlap or if var2 is closer to 0 then the
         * calculated offset.  Otherwise return the calculated offset.
         */
        public calculateYOffset(other: AxisAlignedBB, offsetY: number): number
        {
            if (other.maxX > this.minX && other.minX < this.maxX && other.maxZ > this.minZ && other.minZ < this.maxZ)
            {
                if (offsetY > 0.0 && other.maxY <= this.minY)
                {
                    let d1: number = this.minY - other.maxY;

                    if (d1 < offsetY)
                    {
                        offsetY = d1;
                    }
                }
                else if (offsetY < 0.0 && other.minY >= this.maxY)
                {
                    let d0: number = this.maxY - other.minY;

                    if (d0 > offsetY)
                    {
                        offsetY = d0;
                    }
                }

                return offsetY;
            }
            else
            {
                return offsetY;
            }
        }

        /**
         * if instance and the argument bounding boxes overlap in the Y and X dimensions, calculate the offset between them
         * in the Z dimension.  return var2 if the bounding boxes do not overlap or if var2 is closer to 0 then the
         * calculated offset.  Otherwise return the calculated offset.
         */
        public calculateZOffset(other: AxisAlignedBB, offsetZ: number): number
        {
            if (other.maxX > this.minX && other.minX < this.maxX && other.maxY > this.minY && other.minY < this.maxY)
            {
                if (offsetZ > 0.0 && other.maxZ <= this.minZ)
                {
                    let d1: number = this.minZ - other.maxZ;

                    if (d1 < offsetZ)
                    {
                        offsetZ = d1;
                    }
                }
                else if (offsetZ < 0.0 && other.minZ >= this.maxZ)
                {
                    let d0: number = this.maxZ - other.minZ;

                    if (d0 > offsetZ)
                    {
                        offsetZ = d0;
                    }
                }

                return offsetZ;
            }
            else
            {
                return offsetZ;
            }
        }

        /**
         * Returns whether the given bounding box intersects with this one.
         */
        public intersectsWith(other: AxisAlignedBB): boolean
        {
            return other.maxX > this.minX && other.minX < this.maxX ? (other.maxY > this.minY && other.minY < this.maxY ? other.maxZ > this.minZ && other.minZ < this.maxZ : false) : false;
        }

        /**
         * Returns if the supplied Vec3D is completely inside the bounding box
         */
        public isVecInside(vec: Vec3): boolean
        {
            return vec.xCoord > this.minX && vec.xCoord < this.maxX ? (vec.yCoord > this.minY && vec.yCoord < this.maxY ? vec.zCoord > this.minZ && vec.zCoord < this.maxZ : false) : false;
        }

        /**
         * Returns the average length of the edges of the bounding box.
         */
        public getAverageEdgeLength(): number
        {
            let d0: number = this.maxX - this.minX;
            let d1: number = this.maxY - this.minY;
            let d2: number = this.maxZ - this.minZ;
            return (d0 + d1 + d2) / 3.0;
        }

        /**
         * Returns a bounding box that is inset by the specified amounts
         */
        public contract(x: number, y: number, z: number): AxisAlignedBB
        {
            let d0: number = this.minX + x;
            let d1: number = this.minY + y;
            let d2: number = this.minZ + z;
            let d3: number = this.maxX - x;
            let d4: number = this.maxY - y;
            let d5: number = this.maxZ - z;
            return new AxisAlignedBB(d0, d1, d2, d3, d4, d5);
        }

        public calculateIntercept(vecA: Vec3, vecB: Vec3): MovingObjectPosition
        {
            let vec3: Vec3 = vecA.getIntermediateWithXValue(vecB, this.minX);
            let vec31: Vec3 = vecA.getIntermediateWithXValue(vecB, this.maxX);
            let vec32: Vec3 = vecA.getIntermediateWithYValue(vecB, this.minY);
            let vec33: Vec3 = vecA.getIntermediateWithYValue(vecB, this.maxY);
            let vec34: Vec3 = vecA.getIntermediateWithZValue(vecB, this.minZ);
            let vec35: Vec3 = vecA.getIntermediateWithZValue(vecB, this.maxZ);

            if (!this.isVecInYZ(vec3))
            {
                vec3 = null;
            }

            if (!this.isVecInYZ(vec31))
            {
                vec31 = null;
            }

            if (!this.isVecInXZ(vec32))
            {
                vec32 = null;
            }

            if (!this.isVecInXZ(vec33))
            {
                vec33 = null;
            }

            if (!this.isVecInXY(vec34))
            {
                vec34 = null;
            }

            if (!this.isVecInXY(vec35))
            {
                vec35 = null;
            }

            let vec36: Vec3 = null;

            if (vec3 != null)
            {
                vec36 = vec3;
            }

            if (vec31 != null && (vec36 == null || vecA.squareDistanceTo(vec31) < vecA.squareDistanceTo(vec36)))
            {
                vec36 = vec31;
            }

            if (vec32 != null && (vec36 == null || vecA.squareDistanceTo(vec32) < vecA.squareDistanceTo(vec36)))
            {
                vec36 = vec32;
            }

            if (vec33 != null && (vec36 == null || vecA.squareDistanceTo(vec33) < vecA.squareDistanceTo(vec36)))
            {
                vec36 = vec33;
            }

            if (vec34 != null && (vec36 == null || vecA.squareDistanceTo(vec34) < vecA.squareDistanceTo(vec36)))
            {
                vec36 = vec34;
            }

            if (vec35 != null && (vec36 == null || vecA.squareDistanceTo(vec35) < vecA.squareDistanceTo(vec36)))
            {
                vec36 = vec35;
            }

            if (vec36 == null)
            {
                return null;
            }
            else
            {
                let enumfacing: EnumFacing = null;

                if (vec36 == vec3)
                {
                    enumfacing = EnumFacing.WEST;
                }
                else if (vec36 == vec31)
                {
                    enumfacing = EnumFacing.EAST;
                }
                else if (vec36 == vec32)
                {
                    enumfacing = EnumFacing.DOWN;
                }
                else if (vec36 == vec33)
                {
                    enumfacing = EnumFacing.UP;
                }
                else if (vec36 == vec34)
                {
                    enumfacing = EnumFacing.NORTH;
                }
                else
                {
                    enumfacing = EnumFacing.SOUTH;
                }

                return new MovingObjectPosition(vec36, enumfacing);
            }
        }

        /**
         * Checks if the specified vector is within the YZ dimensions of the bounding box. Args: Vec3D
         */
        private isVecInYZ(vec: Vec3): boolean
        {
            return vec == null ? false : vec.yCoord >= this.minY && vec.yCoord <= this.maxY && vec.zCoord >= this.minZ && vec.zCoord <= this.maxZ;
        }

        /**
         * Checks if the specified vector is within the XZ dimensions of the bounding box. Args: Vec3D
         */
        private isVecInXZ(vec: Vec3): boolean
        {
            return vec == null ? false : vec.xCoord >= this.minX && vec.xCoord <= this.maxX && vec.zCoord >= this.minZ && vec.zCoord <= this.maxZ;
        }

        /**
         * Checks if the specified vector is within the XY dimensions of the bounding box. Args: Vec3D
         */
        private isVecInXY(vec: vec3): boolean
        {
            return vec == null ? false : vec.xCoord >= this.minX && vec.xCoord <= this.maxX && vec.yCoord >= this.minY && vec.yCoord <= this.maxY;
        }

        public toString(): string
        {
            return `box[${this.minX}, ${this.minY}, ${this.minZ} -> ${this.maxX}, ${this.maxY}, ${this.maxZ}]`;
        }

        public hasNaN(): boolean
        {
            return Number.isNaN(this.minX) || Number.isNaN(this.minY) || Number.isNaN(this.minZ) || Number.isNaN(this.maxX) || Number.isNaN(this.maxY) || Number.isNaN(this.maxZ);
        }
    }
}
